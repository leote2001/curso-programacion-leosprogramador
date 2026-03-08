/*eslint-disable*/
"use client";
import { changeCourseEditionStatus } from "../actions";
import { useState, useTransition } from "react";

interface SelectedCourseEditionDetailsProps {
    selectedCourseEditionInfo: any;
    courseEditionStates: string[];
}
export default function SelectedCourseEditionDetails({ selectedCourseEditionInfo, courseEditionStates }: SelectedCourseEditionDetailsProps) {
    const [alert, setAlert] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [statusSelected, setStatusSelected] = useState("");

    const handleStatusUpdate = () => {
        setAlert("");
        setError("");
        if (statusSelected == "finished" || statusSelected == "canceled") {
            if (!confirm(`Seguro que quieres cambiar el estado de la cohorte a ${statusSelected}?`)) {
                return;
            }
        } 
        startTransition(async () => {
            const response = await changeCourseEditionStatus(selectedCourseEditionInfo._id.toString(), statusSelected);
            if (!response.success) {
                setError(response.error);
                return;
            }
            setAlert(response.message as string);
            setStatusSelected("");
        });
    }
    return (
        <>
            <ul>
                <li><p>Título: {selectedCourseEditionInfo.name}</p></li>
                <li><p>Fecha de inicio: {new Date(selectedCourseEditionInfo.startDate).toLocaleDateString("es-ar", { timeZone: "UTC" })}</p></li>
                <li><p>Fecha de finalización: {new Date(selectedCourseEditionInfo.endDate).toLocaleDateString("es-ar", { timeZone: "UTC" })}</p></li>
                <li><p>Hora de inicio: {selectedCourseEditionInfo.startTime}</p></li>
                <li><span>Estado actual: </span><span>{selectedCourseEditionInfo.status}</span>
                    <p>Cambiar a:</p>
                    <select value={statusSelected} onChange={(e) => setStatusSelected(e.target.value)}>
                        <option value={""}>{"Elige"}</option>
                        {courseEditionStates.map((ces) => (
                            <option key={ces} value={ces}>{ces}</option>
                        ))}
                    </select>
                    <button disabled={isPending || !statusSelected} onClick={handleStatusUpdate}>{isPending ? "Cambiando..." : "Cambiar"}</button>
                </li>
                <li><p>Cantidad de alumnos inscriptos: {selectedCourseEditionInfo.studentsQuantity}</p></li>
                <li><p>Cupo de alumnos: {selectedCourseEditionInfo.maxStudents}</p></li>
                <li><p>Precio en pesos argentinos: ${selectedCourseEditionInfo.priceARS}</p></li>
                <li><p>Precio en dólares: ${selectedCourseEditionInfo.priceUSD}</p></li>
                <li><p>Enlace de la reunión de Meet: {selectedCourseEditionInfo.googleMeetUrl}</p></li>
            </ul>
            {error &&
                <p role="alert" aria-live="assertive">{error}</p>
            }
            {alert &&
                <p role="alert" aria-live="assertive">{alert}</p>
            }
        </>
    );
}