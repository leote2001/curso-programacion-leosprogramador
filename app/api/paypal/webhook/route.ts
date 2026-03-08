import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { htmlTemplateForAnyEmail, sendMail } from "@/app/lib/nodemailerConfig";
import { paypal } from "@/app/lib/paypal";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function POST(req: Request) {
    let session;
    let refund = false;
    let inscription;
    let captureId;
    let refundReason = "";
    try {
        await connectDb();
        session = await mongoose.startSession();
        const body = await req.json();
        const verifyResponse = await paypal.post("/v1/notifications/verify-webhook-signature", {
            transmission_id: req.headers.get("paypal-transmission-id"),
            transmission_time: req.headers.get("paypal-transmission-time"),
            transmission_sig: req.headers.get("paypal-transmission-sig"),
            auth_algo: req.headers.get("paypal-auth-algo"),
            cert_url: req.headers.get("paypal-cert-url"),
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            webhook_event: body
        });
        if (verifyResponse.data.verification_status !== "SUCCESS") {
            console.warn("PP: webhook inválido.");
            throw new Error("PP: webhook inválido.");
        }
        if (body.event_type !== "PAYMENT.CAPTURE.COMPLETED") return NextResponse.json(null, { status: 200 });
        const capture = body.resource;
        const amount = capture.amount.value;
        const currency = capture.amount.currency_code;
        captureId = capture.id;
        const orderId = capture.supplementary_data.related_ids.order_id;
        await session.startTransaction();
        inscription = await Inscription.findOne({ paypalOrderId: orderId }).session(session);
        if (!inscription) {
            const refundRes = await paypal.post(`/v2/payments/captures/${captureId}/refund`, { note_to_payer: "No hay inscripción. Reembolso automático." }, { headers: { "PayPal-Request-Id": `ref-${captureId}` } });
            if (refundRes.status !== 201 && refundRes.status !== 200) {
                console.warn("PP: no se pudo devolver dinero.");
                throw new Error("No se pudo devolver dinero.");
            }
            await session.abortTransaction();
            console.log("PP: se devolvió dinero.");
            return NextResponse.json(null, { status: 200 });
        }
        if (inscription.paymentStatus === "approved") {
            await session.abortTransaction();
            return NextResponse.json(null, { status: 200 });
        }
        if (Number(amount) != Number(inscription?.priceUSD) || currency.toString() != "USD") {
            refundReason = "Monto incorrecto. Se devolvió dinero.";
            refund = true
            throw new Error("PP: monto incorrecto. Se devolverá dinero.");
        }
        const courseEdition = await CourseEdition.findById(inscription?.courseEdition).session(session);
        const updated = await CourseEdition.findOneAndUpdate({ _id: courseEdition?._id, studentsQuantity: { $lt: courseEdition?.maxStudents } }, { $inc: { studentsQuantity: 1 } }, { session, new: true });
        if (!updated) {
            refundReason = "Cupo completo o error inesperado.";
            refund = true;
            throw new Error("Cupo completo o error inesperado. Se devolverá dinero.");
        }
        inscription.paymentStatus = "approved";
        inscription.paymentDate = new Date();
        inscription.paymentId = captureId.toString();
        inscription.paymentMessage = "";
        inscription.paymentMethod = "paypal";
        inscription.amountPaid = Number(amount);
        inscription.currency = currency.toString();
        await inscription.save({ session });
        await session.commitTransaction();
        await sendMail({to: inscription.email, subject: "Confirmación de inscripción", html: htmlTemplateForAnyEmail(inscription.fullName, "Inscripción confirmada. En breve recibirás un correo con la información necesaria para comenzar el curso.") });
        console.log("PP: pago confirmado en el webhook y email de confirmación de inscripción enviado.");
        return NextResponse.json(null, { status: 200 });
    } catch (err: any) {
        console.error("Error en webhook de paypal: " + err);
        if (refund && inscription) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = refundReason;
            await inscription.save({ session });
            const refundRes = await paypal.post(`/v2/payments/captures/${captureId}/refund`, {note_to_payer: refundReason}, {headers: {"PayPal-Request-Id": `ref-${captureId}`}});
            if (refundRes.status !== 201 && refundRes.status !== 200) {
                console.warn("PP: no se pudo devolver el dinero.");
                await session?.abortTransaction();
                return NextResponse.json(null, {status: 200});
            }
            await session?.commitTransaction();
            console.log("PP: se devolvió dinero.");
        }
        if (session && session.transaction && session.transaction.isActive && !refund) {
            await session.abortTransaction();
        }
        return NextResponse.json(null, { status: 200 });
    } finally {
        session?.endSession();
    }
}