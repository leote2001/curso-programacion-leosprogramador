/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { updateInscriptionSchema } from "@/app/lib/zodSchemas";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ inscriptionId: string; }> }) {
    const { inscriptionId } = await params;
    try {
        await connectDb();
        const existingInscription = await Inscription.findById(inscriptionId).populate("courseEdition");
        if (!existingInscription) {
            return NextResponse.json({ success: false, error: "No se encontró inscripción." }, { status: 404 });
        }
        console.log("Se obtuvo la inscripción.");
        return NextResponse.json({ success: true, message: "Inscripción obtenida.", inscription: existingInscription }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al obtener inscripción: " + err);
        return NextResponse.json({ success: false, error: "Error inesperado al obtener inscripción por id." }, { status: 500 });
    }
}
export async function PUT(req: Request, { params }: { params: Promise<{ inscriptionId: string; }> }) {
    const { inscriptionId } = await params;
    const body = await req.json();
    const parsed = updateInscriptionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    try {
        await connectDb();
        const existingInscription = await Inscription.findById(inscriptionId);
        if (!existingInscription) {
            return NextResponse.json({ success: false, error: "No se encontró inscripción." }, { status: 404 });
        }
        if (existingInscription.paymentStatus == "approved") return NextResponse.json({ success: false, error: "No se pueden editar las inscripciones que ya han sido pagadas." }, { status: 400 });
        Object.assign(existingInscription, data);
        await existingInscription.save();
        console.log("Inscripción actualizada.");
        return NextResponse.json({ success: true, message: "Inscripción actualizada.", updatedInscription: existingInscription }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al actualizar inscripción: " + err);
        return NextResponse.json({ success: false, error: "Error inesperado al actualizar inscripción." }, { status: 500 });
    }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ inscriptionId: string; }> }) {
    const { inscriptionId } = await params;
    try {
        await connectDb();
        const existingInscription = await Inscription.findById(inscriptionId);
        if (!existingInscription) {
            return NextResponse.json({ success: false, error: "No se encontró inscripción." }, { status: 404 });
        }
        if (existingInscription.paymentStatus === "approved") return NextResponse.json({ success: false, error: "No se puede eliminar inscripción con pago confirmado." }, { status: 400 });
        await existingInscription.deleteOne();
        console.log("Inscripción eliminada.");
        return NextResponse.json({ success: true, message: "Inscripción eliminada." }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al eliminar inscripción: " + err.message);
        return NextResponse.json({ success: false, error: "Error inesperado al eliminar inscripción." }, { status: 500 });
    }
}