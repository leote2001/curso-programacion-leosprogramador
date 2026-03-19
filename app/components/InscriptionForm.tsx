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
interface InscriptionFormProps {
    openCourseEditions: any[];
}

export default function InscriptionForm({ openCourseEditions }: InscriptionFormProps) {
    const {executeRecaptcha} = useGoogleReCaptcha();
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
            const response = await axios.post("/api/create-inscription", {data, token});
            reset({ courseEdition: "", fullName: "", email: "", phone: "", country: "", comment: "", expiresAt: null, paymentMessage: "", paypalOrderId: "", paymentMethod: "none", paymentStatus: "pending", paymentId: "", paymentDate: null, amountPaid: 0, currency: "none" });
            setSuccess(true);
        } catch (err: any) {
            if (err.response.data.error && typeof err.response.data.error != "object") {
                setError(err.response.data.error);
            } else {
                setError("Error.");
            }
        }
    }
    return (
        <>
            {success ?
                <PreinscriptionSuccess />
                :
                <>
                    <h2>Preinscripción</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="fullName">Nombre y apellido</label>
                            <input autoFocus id="fullName" type="text" {...register("fullName")} />
                            {errors.fullName && <p role="alert" aria-live="assertive">{errors.fullName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="email">Correo electrónico</label>
                            <input id="email" type="email" {...register("email")} />
                            {errors.email && <p role="alert" aria-live="assertive">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="country">País</label>
                            <input id="country" type="text" {...register("country")} />
                            {errors.country && <p role="alert" aria-live="assertive">{errors.country.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone">Teléfono</label>
                            <input id="phone" type="text" {...register("phone")} />
                            {errors.phone && <p role="alert" aria-live="assertive">{errors.phone.message}</p>}
                        </div>
                        <UserCourseEditionList openCourseEditions={openCourseEditions} register={register} errors={errors} />
                        <div>
                            <label htmlFor="comment">Comentario</label>
                            <textarea placeholder="Si lo deseas puedes dejar un comentario" id="comment" {...register("comment")}></textarea>
                        </div>
                        <button role="alert" aria-live="assertive" disabled={isSubmitting} type="submit">{!isSubmitting ? "Enviar" : "Enviando..."}</button>
                    </form>
                    {error &&
                    <p role="alert" aria-live="assertive">{error}</p>
                    }
                </>
            }
        </>
    );
}