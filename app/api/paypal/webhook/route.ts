import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { payCapture, verifyInscription, verifyPPWebhook } from "@/app/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
        const inscription = await Inscription.findOne({ paypalOrderId });
        if (!inscription) {
            console.error("PPWebhook: no se encontró inscripción con el paypalOrderId.");
            return NextResponse.json(null, { status: 200 });
        }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition);
        if (!courseEdition) {
            console.error("PPWebhook: no se encontró edición de curso.");
            return NextResponse.json(null, { status: 200 });
        }
        const { success, error } = verifyInscription(inscription, courseEdition);
        if (!success) {
            console.error(`PPWebhook: ${error}`);
            return NextResponse.json(null, { status: 200 });
        }
        console.log("PPWebhook: inscripción y edición de curso verificadas correctamente antes de capturar el pago.");
        const { success: payCaptureSuccess, data, error: payCaptureError } = await payCapture(paypalOrderId);
        if (!payCaptureSuccess) {
            console.error("PPWebhook: " + payCaptureError);
            return NextResponse.json(null, { status: 200 });
        }
        console.log("PPWebhook: se capturó el pago exitosamente: ",JSON.stringify(data, null, 2));
        return NextResponse.json(null, { status: 200 });
    } catch (err: any) {
        console.error("PPWebhook: ", err);
        return NextResponse.json(null, { status: 200 });
    }
}