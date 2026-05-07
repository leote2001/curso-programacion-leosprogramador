import ExpiredInscriptionError from "@/app/components/ExpiredInscriptionError";
import { connectDb } from "@/app/lib/db";
import { Inscription } from "@/app/lib/models/inscription.model";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { createPPOrderAndReturnPayLink } from "@/app/lib/paypal";
import { redirect } from "next/navigation";
interface PayBeforeProps {
    searchParams: { inscriptionId: string; };
}
export default async function CreatePPLink({ searchParams }: PayBeforeProps) {
    let error;
    let link;
    const { inscriptionId } = await searchParams;
    if (!inscriptionId) {
        error = "No hay id de inscripción.";
        return <h2>{error}</h2> 
    }
    try {
        await connectDb();
        const inscription = await Inscription.findById(inscriptionId);
if (!inscription) {
    error = "No se encontró inscripción.";
    return <h2>{error}</h2>
}
if (inscription.paymentStatus === "approved") {
    error = "Inscripción ya pagada.";
    return <h2>{error}</h2>
}
if (inscription.expiresAt.getTime() < Date.now()) {
    return <ExpiredInscriptionError />
}
const courseEdition = await CourseEdition.findById(inscription.courseEdition);
if (!courseEdition) {
    error = "No hay edición de curso.";
    return <h2>{error}</h2>
}
if (courseEdition.status != "open" || courseEdition.studentsQuantity >= courseEdition.maxStudents) {
    error = "No hay inscripciones abiertas o cupo completo.";
    return <h2>{error}</h2>
}
const {email, priceUSD} = inscription;
const {error: ppLinkError, orderId, success, payLink} = await createPPOrderAndReturnPayLink({inscriptionId: inscriptionId.toString(), email, unit_price: priceUSD.toString()});
if (!success) {
    error = ppLinkError;
    return <h2>{error}</h2> 
}
inscription.paypalOrderId = orderId.toString();
await inscription.save();
link = payLink;
    } catch (err: any) {
        console.error("Error en el frontend al intentar obtener link de pago de paypal: ",err);
        error = "Error inesperado al intentar obtener link de pago de Paypal.";
        return <h2>{error}</h2>
    }
    redirect(link);
}