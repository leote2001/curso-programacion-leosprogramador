/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { mp, verifyMercadoPagoWebhook } from "@/app/lib/mercadopago";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { htmlTemplateForAnyEmail, sendMail } from "@/app/lib/nodemailerConfig";
import { PaymentRefund, Payment } from "mercadopago";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
const paymentClient = new Payment(mp);
const refundClient = new PaymentRefund(mp);
export async function POST(req: Request) {
    let session;
    try {
        const body = await req.json();
        const dataId = body.data.id;
        const requestId = req.headers.get("x-request-id")!;
        const signature = req.headers.get("x-signature")!;
        const secret = process.env.MP_WEBHOOK_SECRET as string;
        const isValid = verifyMercadoPagoWebhook(signature, requestId, dataId, secret);
        if (!isValid) {
            console.warn("MPWebhook: webhook sospechoso. No se pudo verificar correctamente.");
            return NextResponse.json(null, {status: 200});
        }
        await connectDb();
        session = await mongoose.startSession();
        if (!body || !body.data) {
            //console.warn("MPWebhook: no hay body o body.data."); 
            return NextResponse.json(null, {status: 200});
        }
        const { id } = body.data;
        if (!id) {
            throw new Error("MP: no se pudo obtener id de pago.");
        }
        const paymentId = id;
        const payment = await paymentClient.get({ id: paymentId });
        if (payment?.status !== "approved") {
            throw new Error("MP: el pago no pudo ser procesado por Mercadopago.");
        }
        if (!payment.external_reference) {
            throw new Error("MP: no se pudo obtener external_reference.");
        }
        const inscriptionId = payment.external_reference;
        session.startTransaction();
        const inscription = await Inscription.findById(inscriptionId).session(session);
        if (!inscription) {
            await refundClient.create({ payment_id: paymentId, requestOptions: { idempotencyKey: `refund-${paymentId}` } });
            throw new Error("MPWebhook: se devolvió dinero porque no se encontró inscripción.");
        }
        let rejectReason = "";
        if (inscription.paymentStatus === "approved") {
            console.warn("MPWebhook: se procesó un pago para una inscripción que ya se pagó. Se devolverá el dinero.");
            await refundClient.create({payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`}});
            console.warn("MPWebhook: se devolvió dinero.");
            await session.abortTransaction();
            return NextResponse.json(null, {status: 200});
            }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition).session(session);
        
        if (!courseEdition || courseEdition.status !== "open") {
            rejectReason = "No se encontró cohorte o las incscripciones están cerradas. Se devolvió el dinero.";
        } else if (inscription.expiresAt < new Date()) {
            rejectReason = "Inscripción expirada. Se devolvió el dinero.";
        } else if (Number(payment.transaction_amount) != Number(inscription.priceARS) || payment.currency_id != "ARS") {
            rejectReason = "Monto incorrecto. Se devolvió el dinero.";
        }
        if (rejectReason) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = rejectReason;
            await inscription.save({session});
            await refundClient.create({payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`}});
            await session.commitTransaction();
            console.log("MP: se devolvió dinero. Razón: "+rejectReason);
            return NextResponse.json(null, {status: 200});
        }
        const updatedCourseEdition = await CourseEdition.findOneAndUpdate({ _id: inscription.courseEdition, studentsQuantity: { $lt: courseEdition?.maxStudents } }, { $inc: { studentsQuantity: 1 } }, { session, new: true });
        if (!updatedCourseEdition) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = "Cupo completo. Se devolvió dinero.";
            await inscription.save({ session });
            await refundClient.create({ payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`} });
            await session.commitTransaction();
            console.warn("MP: se devolvió dinero. Razón: Cupo completo.");
            return NextResponse.json(null, { status: 200 });
        }
        inscription.paymentMethod = "mercadopago";
        inscription.paymentStatus = "approved";
        inscription.paymentMessage = "";
        inscription.paymentId = paymentId.toString();
        inscription.paymentDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
        inscription.amountPaid = Number(payment.transaction_amount);
        inscription.netReceived = Number(payment.transaction_details?.net_received_amount) ?? 0;
        inscription.currency = "ARS";
        await inscription.save({ session });
        await session.commitTransaction();
        console.log("Se confirmó el pago para el alumno " + inscription.fullName + ". El id de pago es: " + paymentId + ". Enviando correo de confirmación...");
        const message = "Inscripción confirmada. En breve recibirás un correo con la info necesaria para poder acceder a las clases. Saludos!";
        const { error: sendMailError, success, message: sendMailMessage } = await sendMail({ to: inscription.email, subject: "Curso Programación Desde Cero + IA - Confirmación de Inscripción", html: htmlTemplateForAnyEmail(inscription.fullName, message) });
        if (!success) {
            console.warn(`MPWebhook: ${sendMailError}`);
        } else {
            console.log(`MPWebhook: ${sendMailMessage}`);
        }
        return NextResponse.json(null, { status: 200 }); 
    } catch (err: any) {
        console.error(`Error en webhook de mercadopago: `,err);
        if (session && session.transaction && session.transaction.isActive) {
        await session?.abortTransaction();
        }
        return NextResponse.json(null, { status: 200 });
    } finally {
        session?.endSession();
    }
}