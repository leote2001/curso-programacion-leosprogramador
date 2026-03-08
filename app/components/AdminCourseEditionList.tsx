/*eslint-disable*/
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState, useTransition } from "react";
import { changeCourseEditionStatus, deleteCourseEdition } from "../actions";
import SelectedCourseEditionDetails from "./SelectedCourseEditionDetails";

interface AdminCourseEditionListProps {
    courseEditionsArray: any[];
}
export default function AdminCourseEditionList({ courseEditionsArray }: AdminCourseEditionListProps) {
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");
    const [isPending, startTransition] = useTransition();
    const courseEditionStates = ["upcoming", "open", "active", "finished", "canceled"];
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedCourseEditionId = searchParams.get("courseEditionId") || "";
    const selectedCourseEditionInfo = courseEditionsArray.find(ce => ce._id.toString() == selectedCourseEditionId.toString()) || null;
    const changeCourseEdition = (e: ChangeEvent<HTMLSelectElement>) => {
        const updatedId = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (updatedId) {
            params.set("courseEditionId", updatedId);
        } else {
            params.delete("courseEditionId");
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
    const handleDeleteCourseEdition = () => {
        setError("");
        setAlert("");
        if (!confirm("Seguro que quieres eliminar la cohorte seleccionada?")) {
            return;
        }
        startTransition(async () => {
            const response = await deleteCourseEdition(selectedCourseEditionId);
            if (!response.success) {
                setError(response.error);
                return;
            }
            const params = new URLSearchParams(searchParams.toString());
            params.delete("courseEditionId");
            router.push(`${pathname}?${params.toString()}`, {scroll: false});
            setAlert(response.message as string);
        });
    }
    return (
        <>
            <h2>Cohortes</h2>
            <select name="courseEditions" id="courseEditions" value={selectedCourseEditionId} onChange={changeCourseEdition}>
                <option value={""}>Selecciona cohorte</option>
                {courseEditionsArray.map(ce => (
                    <option key={ce._id} value={ce._id}>{ce.name}</option>
                ))}
            </select>
            <button disabled={!selectedCourseEditionId} onClick={() => router.push(`/admin/dashboard/update-course-edition/${selectedCourseEditionId}`)}>Editar</button>
            <button disabled={isPending || !selectedCourseEditionId} onClick={handleDeleteCourseEdition}>{isPending ? "Eliminando..." : "Eliminar"}</button>
            <hr />
            {error && 
            <p role="alert" aria-live="assertive">{error}</p>
            }
            {alert && 
            <p role="alert" aria-live="assertive">{alert}</p>
            }
            {selectedCourseEditionInfo &&
                <>
                    <h2>Detalles de la cohorte seleccionada</h2>
                    <SelectedCourseEditionDetails key={selectedCourseEditionId} selectedCourseEditionInfo={selectedCourseEditionInfo} courseEditionStates={courseEditionStates} />
                </>
            }
        </>
    );
}