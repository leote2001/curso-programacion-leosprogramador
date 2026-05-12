/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { htmlTemplateForAnyEmail, sendMail } from "@/app/lib/nodemailerConfig";
import { payCapture, refundPPPayment, verifyInscription, verifyPPWebhook } from "@/app/lib/paypal";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    let refundReason;
    let session;
    let addStudent;
    const headers = req.headers;
    const body = await req.json();
    const { success, error } = await verifyPPWebhook(body, headers);
    if (!success) {
        console.error(`PPWebhook: ${error}`);
        return NextResponse.json(null, { status: 200 });
    }
    console.log("PPWebhook: webhook verificado correctamente.");
    if (body.event_type !== "CHECKOUT.ORDER.APPROVED") return NextResponse.json(null, { status: 200 });
    const paypalOrderId = body.resource.id;
    try {
        await connectDb();
        session = await mongoose.startSession();
        session.startTransaction();
        const inscription = await Inscription.findOne({ paypalOrderId }).session(session);
        if (!inscription) {
            throw new Error("PPWebhook: no se encontró inscripción con el paypalOrderId.");
        }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition).session(session);
        if (!courseEdition) {
            throw new Error("PPWebhook: no se encontró edición de curso.");
        }
        const { success, error } = verifyInscription(inscription, courseEdition);
        if (!success) {
            throw new Error(`PPWebhook: ${error}`);
        }
        console.log("PPWebhook: inscripción y edición de curso verificadas correctamente antes de capturar el pago.");
        const { success: payCaptureSuccess, data, error: payCaptureError } = await payCapture(paypalOrderId);
        if (!payCaptureSuccess) {
            throw new Error("PPWebhook: " + payCaptureError);
        }
        console.log("PPWebhook: se capturó el pago exitosamente: ", JSON.stringify(data, null, 2));
        const capturesData = data.purchase_units[0].payments.captures[0];
        const capturesId = capturesData.id;
        const { currency_code, value: grossAmount } = capturesData.seller_receivable_breakdown.gross_amount;
        const { value: netAmount } = capturesData.seller_receivable_breakdown.net_amount;
        if (currency_code != "USD" || Number(grossAmount) != inscription.priceUSD) {
            refundReason = "La moneda no es USD o el monto total recibido es distinto al de la inscripción.";
        }
        if (!refundReason) {
            addStudent = await CourseEdition.findOneAndUpdate({ _id: inscription.courseEdition, studentsQuantity: { $lt: courseEdition.maxStudents } }, { $inc: { studentsQuantity: 1 } }, {session, new: true });
            if (!addStudent) {
                refundReason = "Cupo completo o edición de curso no encontrada.";
            }
        }
        if (refundReason) {
            inscription.paymentStatus = "rejected";
            inscription.paymentMessage = refundReason;
            await inscription.save(session);
            const { success, data } = await refundPPPayment(capturesId);
            if (!success) {
                throw new Error("PPWebhook: no se pudo devolver dinero: "+ JSON.stringify(data, null, 2));
            }
            await session.commitTransaction();
            console.log("PPWebhook: se devolvió dinero: " + refundReason);
            return NextResponse.json(null, { status: 200 });
        }
        inscription.paymentStatus = "approved";
        inscription.paymentMessage = "";
        inscription.paymentDate = new Date();
        inscription.paymentMethod = "paypal";
        inscription.paymentId = capturesId.toString();
        inscription.amountPaid = Number(grossAmount);
        inscription.netReceived = Number(netAmount);
        inscription.currency = "USD";
        await inscription.save(session);
        await session.commitTransaction();
        console.log("PPWebhook: se confirma la inscripción del alumno: "+inscription.fullName+". Se procederá a enviar mail de confirmación al alumno...");
        const {error: sendMailError, success: sendMailSuccess} = await sendMail({to: inscription.email, subject: "Curso programación desde cero + ia - Inscripción confirmada", html: htmlTemplateForAnyEmail(inscription.fullName, "Inscripción confirmada. En breve recibirás un correo con la  información necesaria para iniciar el curso. Saludos!")});
        if (!sendMailSuccess) {
            console.error(`PPWebhook: ${sendMailError}`);
        } else {
            console.log(`PPWebhook: se envió el mail de confirmación de inscripción al alumno ${inscription.fullName}.`);
        }
        return NextResponse.json(null, { status: 200 });
    } catch (err: any) {
        console.error("PPWebhook: ", JSON.stringify(err, null, 2));
        if (session && session.transaction && session.transaction.isActive) {
            await session.abortTransaction();
        }
        return NextResponse.json(null, { status: 200 });
    } finally {
        session?.endSession();
    }
}