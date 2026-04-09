/*eslint-disable*/
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { UpdateCourseEditionInput, updateCourseEditionSchema } from "../lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosReq, priceWithDiscount } from "../constants";
import { useRouter } from "next/navigation";
import { number } from "zod";
interface UpdateCourseEditionFormProps {
    courseEdition: any;
}
export default function UpdateCourseEditionForm({ courseEdition }: UpdateCourseEditionFormProps) {
    const router = useRouter();
    const disabledFieldIf = courseEdition.status == "active" || courseEdition.studentsQuantity > 0;
    const [error, setError] = useState<any[]>([]);
    const [alert, setAlert] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<UpdateCourseEditionInput>({
        resolver: zodResolver(updateCourseEditionSchema),
        defaultValues: {...courseEdition, startDate: courseEdition.startDate.split("T")[0], endDate: courseEdition.endDate.split("T")[0], priceUSD: 0}
    });
    const onSubmit = async (data: UpdateCourseEditionInput) => {
        setAlert("");
        setError([]);
        try {
            const response = await axiosReq.put(`/api/admin/course-editions/${courseEdition._id}`, data);
            setAlert(response.data.message);
            router.push("/admin/dashboard");
        } catch (err: any) {
            if (typeof err.response.data.error === "object") {
                const errorsArray = Object.values(err.response.data.error.fieldErrors).flat();
                setError(errorsArray);
            } else {
                setError([err.response.data.error]);
            }
        }
    }
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
                <h2 className="text-2xl font-bold border-b pb-2">Editar Edición de Curso</h2>

                {/* Nombre del Curso */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre del Curso</label>
                    <input
                    disabled={disabledFieldIf}
                        autoFocus
                        id="name"
                        {...register("name")}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: Programación desde cero"
                    />
                    {errors.name && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="priceARS">Precio</label>
                        <input type="number" 
                        disabled={disabledFieldIf}
                        id="priceARS"
                        {...register("priceARS", {valueAsNumber: price})}
                        />
                        {errors.priceARS && <p>{errors.priceARS.message}</p>}
                    </div>

                    

                    {/* Fechas */}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium mb-1">Fecha de Inicio</label>
                        <input
                        disabled={disabledFieldIf}
                            id="startDate"
                            type="date"
                            {...register("startDate", { setValueAs: (v) => (v === "" ? undefined : new Date(v)) })}
                            className="w-full p-2 border rounded-md outline-none"
                        />
                        {errors.startDate && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-1">Fecha de Finalización</label>
                        <input
                        disabled={disabledFieldIf}
                            id="endDate"
                            type="date"
                            {...register("endDate", { setValueAs: (v) => (v === "" ? undefined : new Date(v)) })}
                            className="w-full p-2 border rounded-md outline-none"
                        />
                        {errors.endDate && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                    </div>

                    {/* Horario y URL */}
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-1">Horario de Inicio</label>
                        <input
                        disabled={disabledFieldIf}
                            id="startTime"
                            type="text"
                            {...register("startTime")}
                            placeholder="Ej: 19:00hs"
                            className="w-full p-2 border rounded-md outline-none"
                        />
                        {errors.startTime && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="googleMeetUrl" className="block text-sm font-medium mb-1">Google Meet URL</label>
                        <input
                            id="googleMeetUrl"
                            type="text"
                            {...register("googleMeetUrl")}
                            placeholder="https://meet.google.com/..."
                            className="w-full p-2 border rounded-md outline-none"
                        />
                        {errors.googleMeetUrl && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.googleMeetUrl.message}</p>}
                    </div>

                    {/* Estado */}
                    <div className="md:col-span-2">
                        <label htmlFor="status" className="block text-sm font-medium mb-1">Estado</label>
                        <select
                            id="status"
                            {...register("status")}
                            className="w-full p-2 border rounded-md bg-white outline-none"
                        >
                            <option value="upcoming">Próximamente (Upcoming)</option>
                            <option value="open">Inscripciones Abiertas (Open)</option>
                            <option value="active">En Curso (Active)</option>
                            <option value="finished">Finalizado (Finished)</option>
                            <option value="canceled">Cancelado (Canceled)</option>
                        </select>
                        {errors.status && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                    Actualizar Edición
                </button>
            </form>
            {error.length > 0 &&
                <ul>
                    {error.map((err, index) => (
                        <li key={index} role="alert" aria-live="assertive">{err}</li>
                    ))}
                </ul>
            }
            {alert &&
                <p role="alert" aria-live="assertive">{alert}</p>
            }
        </>
    );
}