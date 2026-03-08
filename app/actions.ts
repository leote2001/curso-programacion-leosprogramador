/*eslint-disable*/
"use server";
import { axiosReq } from "./constants";
import { revalidatePath } from "next/cache";

export async function changeCourseEditionStatus(courseEditionId: string, status: string) {
    try {
      console.log("Valor de status: "+status);
  const response = await axiosReq.put(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`, {status});  
  console.log("La cohorte actualizada: "+response.data.updatedCourseEdition.status + ", cantidad de alumnos: "+response.data.updatedCourseEdition.studentsQuantity);
  revalidatePath("/admin/dashboard");
  return {success: true, message: "Cohorte actualizada!"};
    } catch (err: any) {
        console.error("Error en server action para actualizar cohorte: "+err);
        return {success: false, error: err.response.data.error};
    }
} 
export async function deleteCourseEdition(courseEditionId: string) {
 try {
const response = await axiosReq.delete(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`);
return {success: true, message: "Cohorte eliminada!"};
 }    catch (err: any) {
    console.error("Error en la action para eliminar cohorte: "+err);
    return {success: false, error: err.response.data.error};
 }
}