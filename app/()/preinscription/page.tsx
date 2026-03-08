/*eslint-disable*/
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import InscriptionForm from "@/app/components/InscriptionForm";

export default async function Inscription() {
  let courseEditions: any[] = [];
  let error = "";
  let openCourseEditions: any[] = [];
  try {
courseEditions = await CourseEdition.find({status: "open"}).lean();
if (courseEditions.length > 0) {
  openCourseEditions = courseEditions.map(ce => ({_id: ce._id.toString(), name: ce.name, startDate: ce.startDate.toISOString(), startTime: ce.startTime, priceARS: ce.priceARS, priceUSD: ce.priceUSD})); 
}
  } catch (err: any) {
console.error("Error en la página del formulario de inscripción: "+err);
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
