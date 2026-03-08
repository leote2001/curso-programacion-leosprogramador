/*eslint-disable*/
"use client";

import AdminCourseEditionList from "./AdminCourseEditionList";
import InscriptionsTable from "./InscriptionsTable";

interface CEAIProps {
    courseEditionsArray: any[];
    inscriptionsArray: any[];
}
export default function CourseEditionsAndInscriptions({courseEditionsArray, inscriptionsArray}: CEAIProps) {
    return (
    <>
    {courseEditionsArray.length > 0 ?
 <AdminCourseEditionList courseEditionsArray={courseEditionsArray} />
 :
 <p role="alert" aria-live="assertive">No hay cohortes</p>
    }
    <hr />
    {inscriptionsArray.length > 0 ?
 <InscriptionsTable inscriptionsArray={inscriptionsArray} />   
 :
 <p role="alert" aria-live="assertive">No hay inscripciones</p>
    }
    </>
)   ;
}