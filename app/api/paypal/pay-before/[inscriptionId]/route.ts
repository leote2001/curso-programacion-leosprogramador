import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { createPPOrderAndReturnPayLink } from "@/app/lib/paypal";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function GET(req: Request, { params }: { params: { inscriptionId: string; } }) {
    const { inscriptionId } = params;
    try {
        await connectDb();
        const existingInscription = await Inscription.findById(inscriptionId);
        if (!existingInscription) {
            return NextResponse.json({ success: false, error: "No se encontró inscripción." }, { status: 404 });
        }
        const now = new Date();
        if (existingInscription.expiresAt < now) return NextResponse.json({success: false, error: "inscripción ya expirada. No se puede generar link de paypal."}, {status: 400});
        if (existingInscription.paymentStatus === "approved") return NextResponse.json({success: false, error: "Inscripción ya pagada."}, {status: 400});
        const {email} = existingInscription;
        const courseEdition = await CourseEdition.findById(existingInscription.courseEdition);
        if (!courseEdition) return NextResponse.json({success: false, error: "No se encontró cohorte."}, {status: 404});
        if (courseEdition.status !== "open") return NextResponse.json({success: false, error: "Las inscripciones no están abiertas."}, {status: 400});
        if (courseEdition.studentsQuantity >= courseEdition.maxStudents) return NextResponse.json({success: false, error: "Ya no puedes pagar la inscripción. Se alcanzó la cantidad de alumnos permitida."}, {status: 400});
        const getPPLink = await createPPOrderAndReturnPayLink({inscriptionId, email_address:email, value:existingInscription.priceUSD.toString()}, {description:courseEdition.name});
        if (!getPPLink.success) return NextResponse.json({success: false, error: "No se pudo generar link de pago de Paypal."}, {status: 400});
        existingInscription.paypalOrderId = getPPLink.orderId.toString();
        existingInscription.paymentStatus = "pending";
        existingInscription.paymentMethod = "paypal";
        await existingInscription.save();
        return NextResponse.json({success: true, message: "Se obtuvo link de pago de Paypal.", approveLink: getPPLink.approveLink}, {status: 200});
    } catch (err: any) {
        console.error("Error inesperado en la creación de order y link de pago de paypal.");
        return NextResponse.json({ success: false, error: "Error inesperado al crear order y link de paypal." }, { status: 500 });
    }
} 