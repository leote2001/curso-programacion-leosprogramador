import { connectDb } from "@/app/lib/db";
import { createMPPreferenceAndReturnPayLink } from "@/app/lib/mercadopago";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function GET(req: Request, { params }: { params: { inscriptionId: string } }) {
    const { inscriptionId } = params;
    try {
        await connectDb();
        const existingInscription = await Inscription.findById(inscriptionId);
        if (!existingInscription) {
            console.log("Error: no se encontró inscripción.");
            return NextResponse.json({ success: false, error: "No se encontró inscripción." }, { status: 404 });
        }
        const now = new Date();
        if (existingInscription.expiresAt < now) return NextResponse.json({success: false, error: "La inscripción ya expiró. No se puede generar el enlace de pago."}, {status: 400}); 
        if (existingInscription.paymentStatus === "approved") return NextResponse.json({success: false, error: "Inscripción ya pagada."}, {status: 400});
        const {email} = existingInscription;
        const courseEdition = await CourseEdition.findById(existingInscription.courseEdition);
        if (!courseEdition) return NextResponse.json({success: false, error: "No se encontró cohorte."}, {status: 404});
        if (courseEdition.status !== "open") return NextResponse.json({success: false, error: "Las inscripciones no están abiertas."}, {status: 400});
        if (courseEdition.studentsQuantity >= courseEdition.maxStudents) return NextResponse.json({success: false, error: "Ya no puedes pagar tu inscripción. Se alcanzó la cantidad de alumnos permitida."}, {status: 400});
        const getMPLink = await createMPPreferenceAndReturnPayLink({inscriptionId, email, unit_price: existingInscription.priceARS, expiresAt: existingInscription.expiresAt}, {title:courseEdition.name, courseEditionId:courseEdition._id as string});
        if (!getMPLink.success) return NextResponse.json({success: false, error: "Error al crear link de pago de Mercadopago."}, {status: 400});
        return NextResponse.json({success: true, message: "Link de Mercadopago creado.", init_point: getMPLink.init_point}, {status: 200});
    } catch (err: any) {
        console.error("Error inesperado en la creación de link de pago de mercadopago: " + err);
        return NextResponse.json({ success: false, error: "Error inesperado en la creación de link de pago de Mercadopago." }, { status: 500 });
    }
}