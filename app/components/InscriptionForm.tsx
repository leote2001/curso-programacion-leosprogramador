/*eslint-disable*/
"use client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateInscriptionInput, createInscriptionSchema } from "../lib/zodSchemas";
import UserCourseEditionList from "./UserCourseEditionList";
import { useState } from "react";
import axios from "axios";
import PreinscriptionSuccess from "./PreinscriptionSuccess";
import { createInscription } from "../actions";
interface InscriptionFormProps {
    openCourseEditions: any[];
}

export default function InscriptionForm({ openCourseEditions }: InscriptionFormProps) {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateInscriptionInput>({
        resolver: zodResolver(createInscriptionSchema),
        defaultValues: { fullName: "", email: "", phone: "", country: "", comment: "", expiresAt: null, paymentMessage: "", paypalOrderId: "", paymentMethod: "none", paymentStatus: "pending", paymentId: "", paymentDate: null, amountPaid: 0, currency: "none" }
    });
    const onSubmit = async (data: CreateInscriptionInput) => {
        setError("");
        setSuccess(false);
        try {
            if (!executeRecaptcha) return;
            const token = await executeRecaptcha("preinscription_submit");
            console.log(`Recaptcha token: ${token}`);
            const { error: actionError} = await createInscription(data, token);
            if (actionError && typeof actionError != "object") {
                setError(actionError);
                return;
            } else if (actionError) {
                setError("Error al crear preinscripción.");
                return;
            }
            reset({ courseEdition: "", fullName: "", email: "", phone: "", country: "", comment: "", expiresAt: null, paymentMessage: "", paypalOrderId: "", paymentMethod: "none", paymentStatus: "pending", paymentId: "", paymentDate: null, amountPaid: 0, currency: "none" });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        }
    }
    return (
        <>
  {success ? (
    <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg border border-green-200">
      <PreinscriptionSuccess />
    </div>
  ) : (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Preinscripción
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre y Apellido */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
            Nombre y apellido
          </label>
          <input
            autoFocus
            id="fullName"
            type="text"
            {...register("fullName")}
            className={`px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 ${
              errors.fullName 
              ? "border-red-500 focus:ring-red-200" 
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
          {errors.fullName && (
            <p role="alert" aria-live="assertive" className="text-sm text-red-600 italic">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 ${
              errors.email 
              ? "border-red-500 focus:ring-red-200" 
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
          {errors.email && (
            <p role="alert" aria-live="assertive" className="text-sm text-red-600 italic">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* País */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-semibold text-gray-700">
              País
            </label>
            <input
              id="country"
              type="text"
              {...register("country")}
              className={`px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 ${
                errors.country 
                ? "border-red-500 focus:ring-red-200" 
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.country && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600 italic">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
              Teléfono
            </label>
            <input
              id="phone"
              type="text"
              {...register("phone")}
              className={`px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 ${
                errors.phone 
                ? "border-red-500 focus:ring-red-200" 
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            {errors.phone && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600 italic">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Lista de Cursos - Pasa clases de Tailwind si el componente las acepta */}
        <div className="py-2">
          <UserCourseEditionList openCourseEditions={openCourseEditions} register={register} errors={errors} />
        </div>

        {/* Comentario */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comment" className="text-sm font-semibold text-gray-700">
            Comentario
          </label>
          <textarea
            placeholder="Si lo deseas puedes dejar un comentario"
            id="comment"
            rows={3}
            {...register("comment")}
            className="px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          ></textarea>
        </div>

        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
          * Al hacer clic en el botón <strong>Enviar</strong> se te enviará un correo electrónico con un enlace para que puedas abonar el curso. Luego de aprobado el pago tu inscripción quedará confirmada.
        </p>

        {/* Botón de envío */}
        <div className="pt-2">
          <button
            role="alert"
            aria-live="assertive"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all shadow-lg active:scale-95 ${
              isSubmitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
            }`}
          >
            {!isSubmitting ? "Enviar" : "Procesando..."}
          </button>
        </div>
      </form>

      {/* Mensaje de error general */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p role="alert" aria-live="assertive" className="text-center text-red-700 font-medium text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  )}
</>
           );
}