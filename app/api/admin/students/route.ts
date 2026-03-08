/*eslint-disable*/
import { htmlTemplateWithPayLinks, sendMail } from "@/app/lib/nodemailerConfig";
import { createInscriptionSchema } from "@/app/lib/zodSchemas";
import { connectDb } from "@/app/lib/db";
import { Inscription } from "@/app/lib/models/inscription.model";
import { NextResponse } from "next/server";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const courseEditionId = searchParams.get("courseEditionId");
    const query = courseEditionId ? {courseEdition: courseEditionId} : {}; 
    try {
        await connectDb();
        const allInscriptions = await Inscription.find(query).populate("courseEdition").sort({createdAt: -1});
        console.log("Se obtuvieron las inscripciones."); 
        return NextResponse.json({ success: true, message: "Se pudieron obtener las inscripciones.", inscriptions: allInscriptions }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al obtener todas las inscripciones: " + err);
        return NextResponse.json({ success: false, error: "Error inesperado al obtener todas las inscripciones." }, { status: 500 });
    }
}
