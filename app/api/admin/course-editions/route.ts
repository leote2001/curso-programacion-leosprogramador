import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { createCourseEditionSchema } from "@/app/lib/zodSchemas";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function GET() {
    try {
await connectDb();
const allCourseEditions = await CourseEdition.find();
console.log("Se obtuvieron las cohortes.");
return NextResponse.json({success: true, message: "Se obtuvieron las cohortes.", courseEditions: allCourseEditions}, {status: 200}); 
    } catch (err: any) {
        console.error("Error inesperado al obtener cohortes.");
        return NextResponse.json({success: false, error: "Error inesperado al obtener cohortes."}, {status: 500});
    }
}
export async function POST(req: Request) {
    const body = await req.json();
    const preParsed = {...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate)};
    const parsed = createCourseEditionSchema.safeParse(preParsed);
    if (!parsed.success) {
        return NextResponse.json({success: false, error: parsed.error.flatten()}, {status: 400});
    }
    const data = parsed.data;
    if (data.startDate > data.endDate || data.startDate < new Date()) {
        return NextResponse.json({success: false, error: "El inicio debe ser anterior a la finalización y no puede ser anterior a la fecha actual."}, {status: 400});
    }
    try {
        await connectDb();
        const newCourseEdition = await CourseEdition.create(data);
        console.log("Nueva cohorte creada: "+newCourseEdition);
        return NextResponse.json({success: true, message: "Nueva cohorte creada.", newCourseEdition}, {status: 201});
    } catch (err: any) {
        console.error("Error inesperado al crear cohorte: " + err.message);
        return NextResponse.json({ success: false, error: "Error inesperado al crear cohorte." }, { status: 500 });
    }
}