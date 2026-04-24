/*eslint-disable*/
import crypto from "crypto";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESSTOKEN as string
});
const preferenceClient = new Preference(mp); 
export const createMPPreferenceAndReturnPayLink = async (inscriptionInfo: { inscriptionId: string; email: string; unit_price: number; expiresAt: Date;}, course: { title: string; courseEditionId: string;}) => {
    const { email, inscriptionId, unit_price, expiresAt} = inscriptionInfo;
    const { title, courseEditionId } = course;
    const preference = {
        items: [{id: courseEditionId.toString(), title, quantity: 1, unit_price, currency_id: "ARS" }],
        date_of_expiration: expiresAt.toISOString(),
        back_urls: {
            success: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL as string+"/mercadopago/success",
            failure: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL as string+"/mercadopago/failure",
            pending: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL as string+"/mercadopago/pending"
        },
        external_reference: inscriptionId.toString(),
        notification_url: `${process.env.API_BASE_URL}/api/mercadopago/webhook`,
        auto_return: "approved",
        payer: { email }
    };
    try {
    const response = await preferenceClient.create({body: preference, requestOptions: {idempotencyKey: inscriptionId.toString()}});
    console.log("Se creó la preferencia. Se obtuvo link para pagar "+title+". Inscripción con id "+inscriptionId+", cohorte con id "+courseEditionId+".'\n'Link: "+response.init_point+".");
    return {success: true, message: "Preferencia creada. Link obtenido.", init_point: response.init_point};
    } catch (err: any) {
        console.error("Error al crear preferencia: "+err);
        return {success: false, error: err.message};
    }   
}

export const verifyMercadoPagoWebhook = (
  signature: string,
  requestId: string,
  dataId: string,
  secret: string
) => {
  try {
    const parts = signature.split(",");

    let ts = "";
    let hash = "";

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "ts") ts = value;
      if (key === "v1") hash = value;
    }

    if (!ts || !hash) return false;

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);

    const generatedHash = hmac.digest("hex");

    return generatedHash === hash;
  } catch (error) {
    console.error("Error verificando webhook:", error);
    return false;
  }
};