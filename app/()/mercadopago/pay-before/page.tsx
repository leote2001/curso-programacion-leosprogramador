import { createMPPreferenceAndReturnPayLink } from "@/app/lib/mercadopago";
import { redirect } from "next/navigation";
import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { Inscription } from "@/app/lib/models/inscription.model";
import ExpiredInscriptionError from "@/app/components/ExpiredInscriptionError";

/*eslint-disable*/
interface CreateMPPayLinkProps {
    searchParams: { inscriptionId: string };
}
export default async function CreateMPPayLink({ searchParams }: CreateMPPayLinkProps) {
    let error = "";
    let getMPLink;
    const { inscriptionId } = await searchParams;
    if (!inscriptionId) {
        error = "No hay id de inscripción";
        return <h2>{error}</h2>
    }
    try {
        await connectDb();
        const inscription = await Inscription.findById(inscriptionId);
        if (!inscription) {
            error = "No hay inscripción";
            return <h2>{error}</h2>
        }
        if (inscription.paymentStatus === "approved") {
            error = "Inscripción ya pagada";
            return <h2>{error}</h2>
        }
        if (inscription.expiresAt.getTime() < Date.now()) {
            return<ExpiredInscriptionError />
        }
        const courseEdition = await CourseEdition.findById(inscription.courseEdition);
        if (!courseEdition) {
            error = "No hay cohorte";
            return <h2>{error}</h2>
        }
        if (courseEdition.status != "open" || courseEdition.studentsQuantity >= courseEdition.maxStudents) {
            error = "No es posible generar el link de pago";
            return <h2>{error}</h2>
        }
        const { email } = inscription;
        getMPLink = await createMPPreferenceAndReturnPayLink({ inscriptionId, email, unit_price: inscription.priceARS, expiresAt: inscription.expiresAt }, { title: courseEdition.name, courseEditionId: courseEdition._id as string });
        if (!getMPLink.success) {
            error = "No se pudo generar link de pago";
            return <h2>{error}</h2>
        }
    } catch (err: any) {
        console.error("Error en página que crea link de pago de MP: " + err);
        error = "Error inesperado";
        return <h2>{error}</h2>
    }
    redirect(getMPLink.init_point as string);
}