/*eslint-disable*/
"use client";

interface UserCourseEditionListProps {
openCourseEditions: any[];    
register: any;
errors: any;
}
export default function UserCourseEditionList({openCourseEditions, register, errors}: UserCourseEditionListProps) {
return (
    <>
    <div>
        <label htmlFor="courseEdition">Elige a que edición del curso te vas a inscribir</label>
  <select {...register("courseEdition")} id="courseEdition">
    <option value="">Elige</option>  
    {openCourseEditions.map(oce => (
        <option key={oce._id} value={oce._id}>{oce.name} - Inicia: {oce.startDate} - Hora: {oce.startTime} - Precio en pesos argentinos: {oce.priceARS} - Precio en dólares: {oce.priceUSD}</option>
    ))}
    </select>
    {errors.courseEdition && <p role="alert" aria-live="assertive">{errors.courseEdition.message}</p>}
  </div>
    </>
);
}