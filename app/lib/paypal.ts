/*eslint-disable*/
import axios from "axios";
import { NextResponse } from "next/server";
import { Inscription } from "./models/inscription.model";
import { connectDb } from "./db";
import { CourseEdition } from "./models/courseEdition.model";
import mongoose from "mongoose";
import { htmlTemplateForAnyEmail, sendMail } from "./nodemailerConfig";
export const paypal = axios.create({
    baseURL: process.env.PAYPAL_BASE_URL!,
    headers: {
        "Content-Type": "application/json"
    }
});
let cachedToken = "";
let tokenExpiresAt = 0;
const getPaypalAccessToken = async () => {
    const now = Date.now();
    if (cachedToken && tokenExpiresAt > now) {
        console.log("Token obtenido.");
        return { success: true, message: "Token obtenido.", token: cachedToken };
    }
    try {
        const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            new URLSearchParams({ grant_type: "client_credentials" }),
            {
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID!,
                    password: process.env.PAYPAL_CLIENT_SECRET!
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        cachedToken = response.data.access_token;
        tokenExpiresAt = now + response.data.expires_in * 1000 - 60000;
        console.log("Token de paypal obtenido.");
        return { success: true, message: "Token de paypal obtenido.", token: cachedToken };
    } catch (err: any) {
        console.error("Error inesperado al obtener token de paypal: " + err);
        return { success: false, error: "Error inesperado al obtener token de paypal." };
    }
}
paypal.interceptors.request.use(async (config) => {
    const gettingToken = await getPaypalAccessToken();
    if (!gettingToken.success) {
        console.error("Error al obtener token de paypal.");
        throw new Error("Error al obtener token de paypal.");
    }
    const token = gettingToken.token;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export const createPPOrderAndReturnPayLink = async (inscriptionInfo: { inscriptionId: string; email_address: string; value: string; }, course: { description: string; }) => {
    const { inscriptionId, email_address, value } = inscriptionInfo;
    const { description } = course;
    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                reference_id: inscriptionId.toString(),
                description,
                amount: {
                    currency_code: "USD",
                    value: value.toString()
                }
            }
        ],
        application_context: {
            brand_name: "Leo S Programador",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.FRONTEND_BASE_URL as string}/paypal/success`,
            cancel_url: `${process.env.FRONTEND_BASE_URL as string}/paypal/cancel`
        },
        payer: {
            email_address
        }
    };
    try {
        const response = await paypal.post("/v2/checkout/orders", order, {headers: {"PayPal-Request-Id": inscriptionId.toString()}});
        const approveLink = response.data.links.find((link: any) => link.rel === "approve")?.href;
        if (!approveLink) {
            console.error("No se encontró link de pago de paypal.");
            return { success: false, error: "No se encontró link de pago de paypal." };
        }
        console.log("Se obtuvo link de paypal para pagar " + description + ". Inscripción con id " + inscriptionId + ".'\n'Link: " + approveLink + ".");
        return { success: true, message: "Se obtuvo link de pago de paypal.", approveLink, orderId: response.data.id };
    } catch (err: any) {
        console.error("Error inesperado al crear order de paypal: " + err);
        return { success: false, error: "Error al crear order de paypal." };
    }
}
export async function capture(orderId: string) {
    let session;
    try {
        await connectDb();
        session = await mongoose.startSession();
        const order = await paypal.get(`/v2/checkout/orders/${orderId}`);
        const inscriptionId = order.data.purchase_units[0].reference_id;
        const amount = order.data.purchase_units[0].amount.value;
        const currency = order.data.purchase_units[0].amount.currency_code;
        session.startTransaction();
        const inscription = await Inscription.findById(inscriptionId).session(session);
        if (!inscription || inscription.paymentStatus === "approved") {
            throw new Error("No se encontró inscripción o la misma ya fue pagada.");
        }
        if (inscription.expiresAt < new Date()) {
            throw new Error("Inscripción ya expirada.");
        }
        if (Number(amount) != Number(inscription.priceUSD) || currency != "USD") {
            throw new Error("Monto incorrecto.");
        }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition).session(session);
        if (!courseEdition || courseEdition.status !== "open") {
            throw new Error("No se encontró cohorte o las inscripciones están cerradas.");
        }
        const capture = await paypal.post(`/v2/checkout/orders/${orderId}/capture`, {}, {headers: {"PayPal-Request-Id": `cap-${orderId}`}});
        const captureData = capture.data.purchase_units[0].payments.captures[0];
        if (captureData.status !== "COMPLETED") {
            console.warn("Error: paypal no pudo completar el pago.");
            throw new Error("Paypal no pudo completar el pago.");
        }
        const captureId = captureData.id;
        const updatedCourseEdition = await CourseEdition.findOneAndUpdate({ _id: inscription.courseEdition, studentsQuantity: { $lt: courseEdition.maxStudents } }, { $inc: { studentsQuantity: 1 } }, { session, new: true });
        if (!updatedCourseEdition) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = "Cupo completo. Se devuelve dinero.";
            await inscription.save({ session });
            const refundRes = await paypal.post(`/v2/payments/captures/${captureId}/refund`, {note_to_payer: "Cupo agotado. Reembolso automático."}, {headers: {"PayPal-Request-Id": `ref-${captureId}`}});
            if (refundRes.status !== 201 && refundRes.status !== 200) {
                console.warn("PP: no se pudo devolver dinero.");
                throw new Error("Error al devolver dinero.");
            }
            await session.commitTransaction();
            console.log("PP: cupo completo. Se devolvió dinero.");
            return { success: false, error: "PP: cupo completo. Se devolvió dinero." };
        }
        inscription.paymentStatus = "approved";
        inscription.paymentDate = new Date();
        inscription.paymentId = captureId.toString();
        inscription.paymentMessage = "";
        inscription.paymentMethod = "paypal";
        inscription.amountPaid = Number(amount);
        inscription.currency = order.data.purchase_units[0].amount.currency_code;
        await inscription.save({session});
        await session.commitTransaction();
        await sendMail({to: inscription.email, subject: "Confirmación de inscripción", html: htmlTemplateForAnyEmail(inscription.fullName, "Inscripción confirmada. En breve recibirás la información necesaria para comenzar el curso.")});
        console.log("PP: pago capturado y email de confirmación de inscripción enviado.");
        return {success: true, message: "PP: pago capturado."};
    } catch (err: any) {
        console.error("Error en el capture de paypal: " + err);
        if (session && session.transaction && session.transaction.isActive) {
        await session?.abortTransaction();
        }
        return { success: false, error: err.message || "Error interno." };
    } finally {
        session?.endSession();
    }
}