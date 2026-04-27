/*eslint-disable*/
"use server";
import { CourseEdition } from "./lib/models/courseEdition.model";
import { sendMail } from "./lib/nodemailerConfig";
import { createInscriptionSchema } from "./lib/zodSchemas";
import { connectDb } from "./lib/db";
import { axiosReq } from "./constants";
import { htmlTemplateWithPayLinks } from "./lib/nodemailerConfig";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimit } from "./lib/ratelimit";
import { checkRecaptcha } from "./lib/recaptcha";
import { Inscription } from "./lib/models/inscription.model";
export async function changeCourseEditionStatus(courseEditionId: string, status: string) {
    try {
        console.log("Valor de status: " + status);
        const response = await axiosReq.put(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`, { status: status });
        console.log("La cohorte actualizada: " + response.data.updatedCourseEdition.status + ", cantidad de alumnos: " + response.data.updatedCourseEdition.studentsQuantity);
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Cohorte actualizada!" };
    } catch (err: any) {
        console.error("Error en server action para actualizar cohorte: " + err);
        return { success: false, error: err.response.data.error };
    }
}
export async function deleteCourseEdition(courseEditionId: string) {
    try {
        const response = await axiosReq.delete(`${process.env.API_BASE_URL}/api/admin/course-editions/${courseEditionId}`);
        return { success: true, message: "Cohorte eliminada!" };
    } catch (err: any) {
        console.error("Error en la action para eliminar cohorte: " + err);
        return { success: false, error: err.response.data.error };
    }
}
export const getOpenCourseEditions = async () => {
    let courseEditions: any[] = [];
    try {
        await connectDb();
        const gettingCourseEditions = await CourseEdition.find({ status: "open" }).lean();
        console.log("Se obtuvieron las cohortes con inscripciones abiertas.");
        if (gettingCourseEditions.length > 0) {
            courseEditions = gettingCourseEditions.map(ce => ({ _id: ce._id, name: ce.name, startDate: new Date(ce.startDate).toLocaleDateString("es-AR", {timeZone: "utc", weekday: "long", day: "numeric", month: "long", year: "numeric"}), startTime: ce.startTime, priceARS: ce.priceARS}));
        }
        return { success: true, message: "Se obtuvieron las cohortes con inscripciones abiertas.", courseEditions: JSON.parse(JSON.stringify(courseEditions)) };
    } catch (err: any) {
        console.error("Error inesperado al obtener cohortes con inscripciones abiertas.");
        return { success: false, error: "Error inesperado al obtener cohortes." };
    }
}
export const createInscription = async (formData: any, token: string) => {
    if (!token) {
        return {success: false, error: "No hay token de seguridad.", status: 400};
    }
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const {success: rateLimitSuccess, error: rateLimitError, status: rateLimitStatus} = await checkRateLimit(ip); 
    if (!rateLimitSuccess) {
        return {success: false, error: rateLimitError, status: rateLimitStatus};
    }
    const {success: recaptchaSuccess, error: recaptchaError, status: recaptchaStatus} = await checkRecaptcha(token, "preinscription_submit");
    if (!recaptchaSuccess) {
        return {success: false, error: recaptchaError, status: recaptchaStatus};
    }
    const parsed = createInscriptionSchema.safeParse(formData);
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten(), status: 400 };
    }
    const data = parsed.data;
    try {
        await connectDb();
        const alreadyEnrolled = await Inscription.findOne({ email: data.email, courseEdition: data.courseEdition});
        if (alreadyEnrolled?.paymentStatus === "approved") return {success: false, error: "No es posible preinscribir nuevamente. Inscripción ya abonada.", status: 400};
        if (alreadyEnrolled?.expiresAt > new Date()) return {success: false, error: "Ya hay una preinscripción registrada con el correo electrónico ingresado.", status: 400};
        const openCourseEdition = await CourseEdition.findOne({ _id: data.courseEdition, status: "open" });
        if (!openCourseEdition) {
            return { success: false, error: "No se puede realizar la inscripción.", status: 400 };
        }
        if (openCourseEdition.studentsQuantity >= openCourseEdition.maxStudents) return { success: false, error: "No se puede realizar la preinscripción. Ya se alcanzó la cantidad de alumnos permitida para esta edición del curso.", status: 400 };
        let linkMP;
        let newInscription;
        const expiresAt = new Date(); 
        console.log(`Expiracion en milisegundos: ${expiresAt}`);
        expiresAt.setHours(expiresAt.getHours() + 48);
        const inscriptionData = { ...data, priceARS: openCourseEdition.priceARS, priceUSD: openCourseEdition.priceUSD, expiresAt, paymentStatus: "pending", paymentMessage: "", paymentId: "", amountPaid: 0, paymentMethod: "none", currency: "NONE" };
        if (alreadyEnrolled) {
            Object.assign(alreadyEnrolled, inscriptionData);
            await alreadyEnrolled.save();
            linkMP = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/mercadopago/pay-before?inscriptionId=${alreadyEnrolled._id}`;
            } else {
        newInscription = await Inscription.create(inscriptionData);
        linkMP = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/mercadopago/pay-before?inscriptionId=${newInscription._id}`;
        }
        const sendingPayLinkEmail = await sendMail({ to: data.email, subject: "Curso Programación Desde Cero + IA - Enlace de pago", html: htmlTemplateWithPayLinks(data.fullName, linkMP, openCourseEdition) });
        if (!sendingPayLinkEmail.success) {
            return { success: false, error: "Error al enviar email con enlace de pago.", status: 400 };
        }
        if (alreadyEnrolled) {
            console.log("Se volvió a activar la cuenta con mail "+alreadyEnrolled.email); 
            return {success: true, message: "Se cambió la inscripción nuevamente a pending.", status: 200};
        }
        console.log(`Nueva inscripción: ${data.fullName} se inscribió a la cohorte con id: ${newInscription?.courseEdition}.`);
        return { success: true, message: "Preinscripción creada y email con enlaces de pago enviado.", newInscription: JSON.parse(JSON.stringify(newInscription)), status: 201 };
    } catch (err: any) {
        console.error("Error inesperado al crear inscripción: " + err);
        return { success: false, error: "Error inesperado al crear inscripción.", status: 500 };
    }
} 
