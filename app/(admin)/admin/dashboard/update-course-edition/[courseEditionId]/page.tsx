import UpdateCourseEditionForm from "@/app/components/UpdateCourseEditionForm";
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";

/*eslint-disable*/
interface UpdateCourseEditionPageProps {
params: Promise<{courseEditionId: string}>;
}
export default async function UpdateCourseEditionPage({params}: UpdateCourseEditionPageProps) {
    let gettingCourseEdition;
    let courseEdition;
    let error = "";
const {courseEditionId} = await params;
try {
await connectDb();
gettingCourseEdition = await CourseEdition.findById(courseEditionId).lean();
if (!gettingCourseEdition) {
    error = "No se encontró cohorte.";
    return <p role="alert" aria-live="assertive">{error}</p>
}
courseEdition = JSON.parse(JSON.stringify(gettingCourseEdition));
} catch (err: any) {
    console.error("Error en la pagina de actualización de cohorte: "+err)
    error = "Error inesperado en página de actualización de cohorte.";
    return <p role="alert" aria-live="assertive">{error}</p>
}
return (
    <>
<UpdateCourseEditionForm courseEdition={courseEdition} />   
    </>
);
}