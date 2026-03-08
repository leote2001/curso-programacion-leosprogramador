/*eslint-disable*/
import CourseEditionList from "@/app/components/AdminCourseEditionList";
import CourseEditionsAndInscriptions from "@/app/components/CourseEditionsAndInscriptions";
import CourseEditionsStatusFilter from "@/app/components/CourseEditionsStatusFilter";
import InscriptionsTable from "@/app/components/InscriptionsTable";
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import { id } from "zod/locales";
interface AdminHomeProps {
    searchParams: Promise<{ courseEditionId?: string; courseEditionStatus?: string; }>;
}
export default async function AdminHome({ searchParams }: AdminHomeProps) {
    let courseEditions: any[] = [];
    let courseEditionsArray: any[] = [];
    let inscriptions: any[] = [];
    let inscriptionsArray: any[] = [];
    let courseEditionId = "";
    let error = "";
    const params = await searchParams;
    try {
        await connectDb();
        const query = params.courseEditionStatus ? { status: params.courseEditionStatus } : {};
        courseEditions = await CourseEdition.find(query).lean();
        courseEditionsArray = courseEditions.length > 0 ? courseEditions.map(ce => ({ ...ce, _id: ce._id.toString(), startDate: ce.startDate.toISOString(), endDate: ce.endDate.toISOString(), createdAt: ce.createdAt.toISOString(), updatedAt: ce.updatedAt.toISOString() })) : [];
        console.log(`Cohortes: ${courseEditionsArray}`);
        if (params.courseEditionId) {
            courseEditionId = params.courseEditionId;
        }
        inscriptions = courseEditionId ? await Inscription.find({ courseEdition: courseEditionId }).lean() : [];
        inscriptionsArray = inscriptions.length > 0 ? inscriptions.map(i => ({ ...i, _id: i._id.toString(), expiresAt: new Date(i.expiresAt).toISOString(), paymentDate: new Date(i.paymentDate).toISOString() || null, courseEdition: i.courseEdition.toString() })) : [];
        console.log(`Inscripciones: ${inscriptions}`);
    } catch (err: any) {
        console.error("Error en el dashboard: " + err);
        error = err.message;
    }
    return (
        <>
            {error ?
                <p role="alert" aria-live="assertive">{error}</p>
                :
                <>
                <CourseEditionsStatusFilter />
                <CourseEditionsAndInscriptions courseEditionsArray={courseEditionsArray} inscriptionsArray={inscriptionsArray} />
                </>
            }
        </>
    );
}