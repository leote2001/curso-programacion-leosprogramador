/*eslint-disable*/
import { baseUrl } from "../constants";
export const getPPToken = async () => {
    const clientId = process.env.PP_CLIENT_ID;
    const clientSecret = process.env.PP_SECRET_KEY;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${auth}`
            },
            body: "grant_type=client_credentials",
            cache: 'no-store'
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la función que obtiene el token de paypal: ", JSON.stringify(errorData, null, 2));
            return { success: false, error: "Error con token de Paypal." };
        }
        const data = await response.json();
        return { success: true, token: data.access_token };
    } catch (err: any) {
        console.error("Error crítico en fetch:", err);
        return { success: false, error: "Error de red" };
    }
}
export const createPPOrderAndReturnPayLink = async (inscriptionInfo: { inscriptionId: string; email: string; unit_price: string; }) => {
    const { inscriptionId, email, unit_price } = inscriptionInfo;
    const { error, success, token } = await getPPToken();
    if (!success) {
        return { success: false, error };
    }
    const orderData = {
        intent: 'CAPTURE',
        payer: {
            email_address: email,
        },
        purchase_units: [{
            reference_id: inscriptionId,
            amount: { currency_code: 'USD', value: unit_price }
        }],
        application_context: {
            brand_name: "Curso Programación Desde Cero + IA",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/paypal/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}`
        }
    }
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) {
        return { success: false, error: "Error al crear orden." };
    }
    const data = await response.json();
    const searchLink = data.links.find((link: any) => link.rel === "approve");
    return { success: true, payLink: searchLink.href, orderId: data.id };
}
export const verifyPPWebhook = async (body: any, headers: any) => {
    const webhookId = process.env.PP_WEBHOOK_ID;
    const { token, success } = await getPPToken();
    if (!success) {
        return { success: false, error: "Error al obtener token de paypal." };
    }
    const verificationBody = {
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: body,
    };
    try {
        const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(verificationBody)
        });
        const verificationData = await response.json();
        if (verificationData.verification_status !== "SUCCESS") {
            return { success: false, error: "Webhook de paypal sospechoso." };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: "Error inesperado en función que verifica webhook de paypal." };
    }
}
export const verifyInscription = (inscription: any, courseEdition: any) => {
    if (inscription.paymentStatus === "approved") {
        return { success: false, error: "Inscripción ya pagada." };
    }
    if (inscription.expiresAt.getTime() < Date.now()) {
        return { success: false, error: "Inscripción ya expirada." };
    }

    if (courseEdition.status !== "open" || courseEdition.studentsQuantity >= courseEdition.maxStudents) {
        return { success: false, error: "Inscripciones no abiertas o cupo completo." };
    }
    return { success: true };
}
export const payCapture = async (paypalOrderId: string) => {
    const { token, success } = await getPPToken();
    if (!success) {
        return { success: false, error: "Error al obtener token." };
    }
    try {
        const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        const captureData = await response.json();
        if (captureData.status !== "COMPLETED") {
            return { success: false, error: "Error en función de captura de pago de paypal. El pago no pudo ser capturado." };
        }
        return { success: true, data: captureData };
    } catch (err: any) {
        return { success: false, error: "Error inesperado en función que captura el pago de paypal." };
    }
}
export const refundPPPayment = async (captureId: string) => {
    const { token, success } = await getPPToken();
    if (!success) {
        return { success: false, error: "Error al obtener token en función que hace refund de paypal." };
    }
    try {
        const response = await fetch(`${baseUrl}/v2/payments/captures/${captureId}/refund`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "PayPal-Request-Id": `refund-${captureId}`,
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        if (data.status !== "COMPLETED") {
            return { success: false, error: "Error en función que hace refund. No fue posible devolver el dinero." };
        }
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: "Error inesperado en función que hace refund de paypal." };
    }
}