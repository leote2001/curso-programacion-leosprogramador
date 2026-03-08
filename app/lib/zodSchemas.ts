import z from "zod";
export const createInscriptionSchema = z.object({
    fullName: z.string().min(3, "Se requieren al menos 3 caracteres.").max(100, "No puede superar los 100 caracteres.").trim(),
    email: z.string().email("Ingresa un email válido.").toLowerCase().max(88, "No puede superar los 88 caracteres.").trim(),
    country: z.string().min(1, "Ingresa un país.").max(88, "No puede superar los 88 caracteres.").trim(),
    phone: z.string().trim().min(5, "No puede tener menos de 5 caracteres.").max(50, "No puede superar los 50 caracteres."),
    courseEdition: z.string().min(1, "Elige una edición del curso."),
    comment: z.string().trim().max(185, "No puede superar los 185 caracteres."),
    expiresAt: z.date().nullable(),
    paymentMessage: z.string(),
    paypalOrderId: z.string(),
    paymentMethod: z.enum(["mercadopago", "paypal", "none"]),
    paymentStatus: z.enum(["pending", "approved", "rejected"]),
    paymentId: z.string(),
    paymentDate: z.date().nullable(),
    amountPaid: z.number().min(0),
    currency: z.enum(["ARS", "USD", "none"])
});
export const updateInscriptionSchema = z.object({
    country: z.string().min(1, "Ingresa un país.").max(88, "No puede superar los 88 caracteres.").trim().optional(),
    phone: z.string().trim().min(5, "No puede tener menos de 5 caracteres.").max(50, "No puede superar los 50 caracteres.").optional(),
    comment: z.string().trim().max(185, "No puede superar los 185 caracteres.").optional()
})
    .refine(data => Object.keys(data).length > 0, {
        message: "Para actualizar se necesita al menos un campo."
    });
export type CreateInscriptionInput = z.infer<typeof createInscriptionSchema>;
export type UpdateInscriptionInput = z.infer<typeof updateInscriptionSchema>;

export const createCourseEditionSchema = z.object({
    name: z.string(),
    priceARS: z.number().min(0),
    priceUSD: z.number().min(0),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),  
    googleMeetUrl: z.string(),
    status: z.enum(["upcoming", "open", "active", "finished", "canceled"])
})
    .superRefine((data, ctx) => {
        if (data.startDate >= data.endDate) {
            ctx.addIssue({
                path: ["startDate"],
                message: "La fecha de inicio debe ser anterior a la fecha de finalización.",
                code: z.ZodIssueCode.custom
            });
        }
    });
export const updateCourseEditionSchema = z.object({
    name: z.string().optional(),
    priceARS: z.number().min(0).optional(),
    priceUSD: z.number().min(0).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    startTime: z.string().optional(),
    googleMeetUrl: z.string().optional(),
    status: z.enum(["upcoming", "open", "active", "finished", "canceled"]).optional()
})
    .refine(data => Object.keys(data).length > 0, {
        message: "Se necesita al menos un campo para actualizar."
    });
    export type CreateCourseEditionInput = z.infer<typeof createCourseEditionSchema>;
export type UpdateCourseEditionInput = z.infer<typeof updateCourseEditionSchema>; 