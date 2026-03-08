import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function GET() {
    let courseEditions: any[] = []; 
    try {
await connectDb();
const gettingCourseEditions = await CourseEdition.find({status: "open"});
console.log("Se obtuvieron las cohortes con inscripciones abiertas.");
if (gettingCourseEditions.length > 0) {
courseEditions = gettingCourseEditions.map(ce => ({_id: ce._id, name: ce.name, startDate: ce.startDate, startTime: ce.startTime, priceARS: ce.priceARS, priceUSD: ce.priceUSD }));
}
return NextResponse.json({success: true, message: "Se obtuvieron las cohortes con inscripciones abiertas.", courseEditions}, {status: 200}); 
    } catch (err: any) {
        console.error("Error inesperado al obtener cohortes con inscripciones abiertas.");
        return NextResponse.json({success: false, error: "Error inesperado al obtener cohortes."}, {status: 500});
    }
}
