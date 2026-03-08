/*eslint-disable*/
"use client";
import { CreateCourseEditionInput, createCourseEditionSchema } from "../lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { axiosReq } from "../constants";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
export default function CreateCourseEditionForm() {
  const router = useRouter();
  const [alert, setAlert] = useState("");
  const [error, setError] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCourseEditionInput>({
    resolver: zodResolver(createCourseEditionSchema),
    defaultValues: { status: "upcoming", googleMeetUrl: "https://" }
  });
  const onSubmit = async (data: CreateCourseEditionInput) => {
    setError([]);
    setAlert("");
    try {
      await axiosReq.post("/api/admin/course-editions", data);
      setAlert("Cohorte creada!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      if (typeof err.response.data.error === "object") {
        const errorMessages: any = Object.values(err.response.data.error.fieldErrors).flat();
        setError(errorMessages);
      } else {
        setError([err.response.data.error]);
      }
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
        <h2 className="text-2xl font-bold border-b pb-2">Nueva Edición de Curso</h2>

        {/* Nombre del Curso */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Nombre del Curso</label>
          <input
            autoFocus
            id="name"
            {...register("name")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Programación desde cero"
          />
          {errors.name && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precios */}
          <div>
            <label htmlFor="priceARS" className="block text-sm font-medium mb-1">Precio ARS</label>
            <input
              id="priceARS"
              type="number"
              {...register("priceARS", { valueAsNumber: true })}
              className="w-full p-2 border rounded-md outline-none"
            />
            {errors.priceARS && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.priceARS.message}</p>}
          </div>

          <div>
            <label htmlFor="priceUSD" className="block text-sm font-medium mb-1">Precio USD</label>
            <input
              id="priceUSD"
              type="number"
              {...register("priceUSD", { valueAsNumber: true })}
              className="w-full p-2 border rounded-md outline-none"
            />
            {errors.priceUSD && <p role="alert" aria-live="assertive" className="text-red-500 text-xs mt-1">{errors.priceUSD.message}</p>}
          </div>

          {/* Fechas */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">Fecha de Inicio</label>
            <input
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
          Guardar Edición
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