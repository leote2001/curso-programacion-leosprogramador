export const getPPToken = async () => {
    const clientId = process.env.PP_CLIENT_ID;
    const clientSecret = process.env.PP_SECRET_KEY;
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
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
            console.error("Error en la función que obtiene el token de paypal: ",errorData);
            return { success: false, error: "Error con token de Paypal."}; 
        }
        const data = await response.json();
        return { success: true, token: data.access_token };
    } catch (err) {
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
            brand_name: "Leo S Programador",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/paypal/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/paypal/failure`
        }
    } 
        const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            return {success: false, error: "Error al crear orden."};
        }
        const data = await response.json();
        const searchLink = data.links.find((link: any) => link.rel === "approve"); 
        return {success: true, payLink: searchLink.href, orderId: data.id};
    }
