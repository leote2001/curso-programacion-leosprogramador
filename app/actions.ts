/*eslint-disable*/
"use server";
import { CourseEdition } from "./lib/models/courseEdition.model";
import { connectDb } from "./lib/db";
import { axiosReq } from "./constants";
import { revalidatePath } from "next/cache";

export async function changeCourseEditionStatus(courseEditionId: string, status: string) {
    try {
        console.log("Valor de status: " + status);
        const response = await axiosReq.put(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`, { status });
        console.log("La cohorte actualizada: " + response.data.updatedCourseEdition.status + ", cantidad de alumnos: " + response.data.updatedCourseEdition.studentsQuantity);
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Cohorte actualizada!" };
    } catch (err: any) {
        console.error("Error en server action para actualizar cohorte: " + err);
        return { success: false, error: err.response.data.error };
    }
}
export async function deleteCourseEdition(courseEditionId: string) {
    try {
        const response = await axiosReq.delete(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`);
        return { success: true, message: "Cohorte eliminada!" };
    } catch (err: any) {
        console.error("Error en la action para eliminar cohorte: " + err);
        return { success: false, error: err.response.data.error };
    }
}
export const getOpenCourseEditions = async () => {
    let courseEditions: any[] = [];
    try {
        await connectDb();
        const gettingCourseEditions = await CourseEdition.find({ status: "open" }).lean();
        console.log("Se obtuvieron las cohortes con inscripciones abiertas.");
        if (gettingCourseEditions.length > 0) {
            courseEditions = gettingCourseEditions.map(ce => ({ _id: ce._id, name: ce.name, startDate: new Date(ce.startDate).toLocaleDateString("es-AR", {timeZone: "America/Argentina/Buenos_Aires", weekday: "long", day: "numeric", month: "long", year: "numeric"}), startTime: ce.startTime, priceARS: ce.priceARS}));
        }
        return { success: true, message: "Se obtuvieron las cohortes con inscripciones abiertas.", courseEditions: JSON.parse(JSON.stringify(courseEditions)) };
    } catch (err: any) {
        console.error("Error inesperado al obtener cohortes con inscripciones abiertas.");
        return { success: false, error: "Error inesperado al obtener cohortes." };
    }
}
