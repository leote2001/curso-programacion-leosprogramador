/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { mp } from "@/app/lib/mercadopago";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { htmlTemplateForAnyEmail, sendMail } from "@/app/lib/nodemailerConfig";
import { Payment, PaymentRefund } from "mercadopago";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const paymentClient = new Payment(mp);
const refundClient = new PaymentRefund(mp);
export async function POST(req: Request) {
    let session;
    try {
        await connectDb();
        session = await mongoose.startSession();
        const body = await req.json();
        console.log("El body: ",body)
        if (body.type !== "payment") {
            console.warn(`MPWebhook: se ignora notificación porque no es un pago.`);
            return NextResponse.json(null, { status: 200 });
        }
        const paymentId = body.data.id;
        console.log("El paymentId: "+paymentId)
        if (!paymentId) {
            console.log("No hay paymentId");
            return NextResponse.json(null, {status: 200});
        }
        const payment = await paymentClient.get({id: paymentId.toString()})
        console.log("El objeto payment: ",payment)
        if (!payment) {
            console.log("No se encontró el pago.");
            return NextResponse.json(null, {status: 200});
        }
        if (payment.status !== "approved") {
            console.warn("MPWebhook: pago no aprobado. PaymentStatus: " + payment.status);
            return NextResponse.json(null, { status: 200 });
        }
        if (!payment.external_reference) {
        throw new Error("MPWebhook: no se encontró external_reference en payment.");
        }
        const inscriptionId = payment.external_reference;
        await session.startTransaction();
        const inscription = await Inscription.findById(inscriptionId).session(session);
        if (!inscription) {
            await refundClient.create({ payment_id: paymentId, requestOptions: { idempotencyKey: `refund-${paymentId}` } });
            throw new Error("MPWebhook: se devolvió dinero porque no se encontró inscripción.");
        }
        if (inscription.paymentId.toString() == paymentId.toString()) {
            console.warn("MPWebhook: se ignora notificación. Pago ya procesado.");
            await session.abortTransaction();
            return NextResponse.json(null, { status: 200 });
        }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition).session(session);
        let rejectReason = "";
        if (!courseEdition || courseEdition.studentsQuantity >= courseEdition.maxStudents) {
            rejectReason = "Cupo completo o edición de curso no encontrada.";
        } else if (inscription.expiresAt < new Date()) {
            rejectReason = "Inscripción expirada.";
        } else if (Number(payment.transaction_amount) != Number(inscription.priceARS) || payment.currency_id?.toString() != inscription.currency.toString()) {
            rejectReason = "Monto incorrecto o moneda equivocada.";
        } else {
            const updateCourseEdition = await CourseEdition.findOneAndUpdate({ _id: inscription.courseEdition, studentsQuantity: { $lt: courseEdition.maxStudents } }, { $inc: { studentsQuantity: 1 } }, { session, new: true });
            if (!updateCourseEdition) rejectReason = "Cupo completo: no se pudo inscribir al usuario.";
        }
        if (rejectReason) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = rejectReason;
            await inscription.save({ session });
            await refundClient.create({ payment_id: paymentId, requestOptions: { idempotencyKey: `refund-${paymentId}` } });
            await session.commitTransaction();
            console.log("Se devolvió dinero: " + rejectReason);
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
        const { error: sendMailError, success, message: sendMailMessage } = await sendMail({ to: inscription.email, subject: "Intro a la Programación - Confirmación de Inscripción", html: htmlTemplateForAnyEmail(inscription.fullName, message) });
        if (!success) {
            console.warn(`MPWebhook: ${sendMailError}`);
        } else {
            console.log(`MPWebhook: ${sendMailMessage}`);
        }
        return NextResponse.json(null, { status: 200 });
    } catch (err: any) {
        console.error(`Error en webhook de Mercadopago: `,err);
        if (session && session.transaction && session.transaction.isActive) {
            await session.abortTransaction();
        }
        return NextResponse.json(null, { status: 200 });
    } finally {
        session?.endSession();
    }
}