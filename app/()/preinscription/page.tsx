/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import InscriptionForm from "@/app/components/InscriptionForm";
import { getOpenCourseEditions } from "@/app/actions";

export default async function Inscription() {
  let courseEditions: any[] = [];
  let error = "";
  let openCourseEditions: any[] = [];
  try {
    const {success: oCourseEditionsSuccess, courseEditions: oCourseEditions, error: oCourseEditionsError} = await getOpenCourseEditions();
    if (!oCourseEditionsSuccess) {
      throw new Error(oCourseEditionsError);
    }
    openCourseEditions = oCourseEditions;
  } catch (err: any) {
    console.error("Error en la página del formulario de inscripción: " + err);
    error = err.message;
  }
  return (
    <>
      {error ?
        <p role="alert" aria-live="assertive">{error}</p>
        :
        openCourseEditions.length > 0 ?
          <InscriptionForm openCourseEditions={openCourseEditions} />
          :
          <p role="alert" aria-live="assertive">Actualmente no es posible inscribirse</p>
      }
    </>
  );
}
