/*eslint-disable*/
import { htmlTemplateWithPayLinks, sendMail } from "@/app/lib/nodemailerConfig";
import axios from "axios";
import { createInscriptionSchema } from "@/app/lib/zodSchemas";
import { connectDb } from "@/app/lib/db";
import { Inscription } from "@/app/lib/models/inscription.model";
import { NextResponse } from "next/server";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { recaptchaSecretKey } from "@/app/constants";
import { checkRateLimit } from "@/app/lib/ratelimit";
import { checkRecaptcha } from "@/app/lib/recaptcha";

export async function POST(req: Request) {
    const body = await req.json();
    const {data: formData, token} = body;
    if (!token) {
        return NextResponse.json({success: false, error: "No hay token de seguridad."}, {status: 400});
    }
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const {success: rateLimitSuccess, error: rateLimitError, status: rateLimitStatus} = await checkRateLimit(ip); 
    if (!rateLimitSuccess) {
        return NextResponse.json({success: false, error: rateLimitError}, {status: rateLimitStatus});
    }
    const {success: recaptchaSuccess, error: recaptchaError, status: recaptchaStatus} = await checkRecaptcha(token, "preinscription_submit");
    if (!recaptchaSuccess) {
        return NextResponse.json({success: false, error: recaptchaError}, {status: recaptchaStatus});
    }
    const parsed = createInscriptionSchema.safeParse(formData);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    try {
        await connectDb();
        const openCourseEdition = await CourseEdition.findOne({ _id: data.courseEdition, status: "open" });
        if (!openCourseEdition) {
            return NextResponse.json({ success: false, error: "No se puede realizar la inscripción." }, { status: 400 });
        }
        if (openCourseEdition.studentsQuantity >= openCourseEdition.maxStudents) return NextResponse.json({ success: false, error: "No se puede realizar la preinscripción. Ya se alcanzó la cantidad de alumnos permitida para esta edición del curso." }, { status: 400 });
        let linkMP;
        let newInscription;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        const inscriptionData = { ...data, priceARS: openCourseEdition.priceARS, priceUSD: openCourseEdition.priceUSD, expiresAt, paymentStatus: "pending", paymentMessage: "", paymentId: "", amountPaid: 0, paymentMethod: "none", currency: "NONE" };
        const alreadyEnrolled = await Inscription.findOne({ email: data.email, courseEdition: openCourseEdition._id });
        if (alreadyEnrolled) {
            const isExpired = alreadyEnrolled.paymentStatus !== "approved" && alreadyEnrolled.expiresAt < new Date(); 
            if (!isExpired) return NextResponse.json({success: false, error: "Ya existe una inscripción activa."}, {status: 400});
            Object.assign(alreadyEnrolled, inscriptionData);
            await alreadyEnrolled.save();
            linkMP = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/mercadopago/pay-before?inscriptionId=${alreadyEnrolled._id}`;
            } else {
        newInscription = await Inscription.create(inscriptionData);
        linkMP = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/mercadopago/pay-before?inscriptionId=${newInscription._id}`;
        }
        const sendingPayLinkEmail = await sendMail({ to: data.email, subject: "Intro a la programación - Enlace de pago", html: htmlTemplateWithPayLinks(data.fullName, linkMP) });
        if (!sendingPayLinkEmail.success) {
            return NextResponse.json({ success: false, error: "Error al enviar email con enlace de pago." }, { status: 400 });
        }
        if (alreadyEnrolled) {
            console.log("Se volvió a activar la cuenta con mail "+alreadyEnrolled.email); 
            return NextResponse.json({success: true, message: "Se cambió la inscripción nuevamente a pending."}, {status: 200});
        }
        console.log(`Nueva inscripción: ${data.fullName} se inscribió a la cohorte con id: ${newInscription?.courseEdition}.`);
        return NextResponse.json({ success: true, message: "Inscripción creada y email con enlaces de pago enviado.", newInscription }, { status: 201 });
    } catch (err: any) {
        console.error("Error inesperado al crear inscripción: " + err);
        return NextResponse.json({ success: false, error: "Error inesperado al crear inscripción." }, { status: 500 });
    }
} 