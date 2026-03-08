/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { mp } from "@/app/lib/mercadopago";
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
        await connectDb();
        session = await mongoose.startSession();
        const body = await req.json();
        const { id } = body.data;
        if (!id) {
            throw new Error("MP: no se pudo obtener id de pago.");
        }
        const paymentId = id;
        const payment = await paymentClient.get({ id: paymentId });
        if (!payment || payment.status !== "approved") {
            throw new Error("MP: no se encontró pago o el mismo no pudo ser procesado por Mercadopago.");
        }
        if (!payment.external_reference) {
            throw new Error("MP: no se pudo obtener external_reference.");
        }
        const inscriptionId = payment.external_reference;
        session.startTransaction();
        const inscription = await Inscription.findById(inscriptionId).session(session);
        if (!inscription || inscription.paymentStatus === "approved") {
            if (inscription && inscription.paymentId?.toString() == paymentId.toString()) {
                console.warn("MP: notificación repetida. No se hace nada.");
                await session.abortTransaction();
                return NextResponse.json(null, {status: 200}); 
            }
            const refundRes = await refundClient.create({payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`}});
            if (refundRes.status !== "approved") {
                console.warn("MP: no se pudo devolver dinero.");
                throw new Error("MP: no se pudo devolver dinero.");
            }
            console.warn("MP: no se encontró inscripción o la misma ya fue pagada. Se devolvió el dinero.");
            await session.abortTransaction();
            return NextResponse.json(null, {status: 200});
        } 
        const courseEdition = await CourseEdition.findById(inscription.courseEdition).session(session);
        let rejectReason = "";
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
            const refundRes = await refundClient.create({payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`}});
            if (refundRes.status !== "approved") {
                console.warn("MP: no se pudo devolver el dinero.");
                throw new Error("MP: no se pudo devolver el dinero.");
            }
            await session.commitTransaction();
            console.log("MP: se devolvió dinero. Razón: "+rejectReason);
            return NextResponse.json(null, {status: 200});
        }
        const updatedCourseEdition = await CourseEdition.findOneAndUpdate({ _id: inscription.courseEdition, studentsQuantity: { $lt: courseEdition?.maxStudents } }, { $inc: { studentsQuantity: 1 } }, { session, new: true });
        if (!updatedCourseEdition) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = "Cupo completo. Se devolvió dinero.";
            await inscription.save({ session });
            const refundRes = await refundClient.create({ payment_id: paymentId, requestOptions: {idempotencyKey: `refund-${paymentId}`} });
            if (refundRes.status !== "approved") {
                console.warn("MP: no se pudo devolver dinero.");
                throw new Error("Error al devolver el dinero.");
            }
            await session.commitTransaction();
            console.warn("MP: se devolvió dinero. Razón: Cupo completo.");
            return NextResponse.json(null, { status: 200 });
        }
        inscription.paymentStatus = "approved";
        inscription.paymentId = paymentId.toString();
        inscription.paymentDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
        inscription.paymentMethod = "mercadopago";
        inscription.amountPaid = payment.transaction_amount ?? 0;
        inscription.paymentMessage = "";
        inscription.currency = payment.currency_id as any
        await inscription.save({ session });
        await session.commitTransaction();
        await sendMail({to: inscription.email, subject: "Confirmación de inscripción", html: htmlTemplateForAnyEmail(inscription.fullName, "Inscripción confirmada. En breve recibirás un correo con la información necesaria para comenzar el curso.")});
        console.log(`MP(Nueva inscripción): paymentId ${paymentId} de la inscripción ${inscription._id}. Email de confirmación de inscripción enviado.`);
        return NextResponse.json(null, { status: 200 });
    } catch (err: any) {
        console.error(`Error en webhook de mercadopago: ${err}`);
        if (session && session.transaction && session.transaction.isActive) {
        await session?.abortTransaction();
        }
        return NextResponse.json(null, { status: 200 });
    } finally {
        session?.endSession();
    }
}