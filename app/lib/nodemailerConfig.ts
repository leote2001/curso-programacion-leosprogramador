/*eslint-disable*/
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export const sendMail = async (options: {
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        // Al pasar ...options, Nodemailer recibe la propiedad 'html' correctamente
        await transporter.sendMail({ 
            from: `"Curso Programación Desde Cero + IA - Leo S Programador" <${process.env.EMAIL_USER}>`, 
            ...options 
        });
        return { success: true, message: "Se envió email al estudiante." };
    } catch (err: any) {
        console.error("Error al enviar email al estudiante: " + err);
        return { success: false, error: "Error al enviar email al estudiante." };
    }
}

export const htmlTemplateWithPayLinks = (fullName: string, linkMP: string) => {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px;">
            Hola ${fullName}!
        </h2>
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Gracias por preinscribirte al curso. Aquí tienes el enlace de pago:
        </p>
        <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin-top: 24px;">MercadoPago</h3>
        <p style="margin-bottom: 12px;">
            <a href="${linkMP}" target="_blank" style="color: #2563eb; text-decoration: underline; font-size: 16px;">
                Pagar con MercadoPago
            </a>
        </p>
        <p style="font-size: 16px; color: #374151; margin-top: 20px;">
            ¡Nos vemos en clase!
        </p>
        <hr style="margin: 28px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            Leo Sales – Full-Stack Developer / Backend Developer
        </p>
        <p style="font-size: 14px; margin-bottom: 4px;">
            Sitio web: <a href="https://leosprogramador.portfolio-ls.online" target="_blank" style="color: #2563eb; text-decoration: underline;">Leo S Programador</a>
        </p>
        <p style="font-size: 14px;">
            Whatsapp: <a href="https://wa.link/pxwg5p" target="_blank" style="color: #2563eb; text-decoration: underline;">+54 387 211 6552</a>
        </p>
    </div>`;
}

export const htmlTemplateForAnyEmail = (fullName: string, message: string) => {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px;">
            Hola ${fullName}!
        </h2>
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            ${message}
        </p>
        <hr style="margin: 28px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
            Leo Sales – Full-Stack Developer / Backend Developer
        </p>
        <p style="font-size: 14px; margin-bottom: 4px;">
            Sitio web: <a href="https://leosprogramador.portfolio-ls.online" target="_blank" style="color: #2563eb; text-decoration: underline;">Leo S Programador</a>
        </p>
        <p style="font-size: 14px;">
            Whatsapp: <a href="https://wa.link/pxwg5p" target="_blank" style="color: #2563eb; text-decoration: underline;">+54 387 211 6552</a>
        </p>
    </div>`;
}