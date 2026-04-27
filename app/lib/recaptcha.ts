/*eslint-disable*/
import { recaptchaSecretKey } from "../constants";

export const checkRecaptcha = async (token: string, action: string) => {
    try {
        const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `secret=${recaptchaSecretKey}&response=${token}`
        });
        const verifyResData = await verifyRes.json();
        console.log("recaptchaScore: " + verifyResData.score);
        if (!verifyResData.success || verifyResData.score < 0.5 || verifyResData.action !== action) {
            return { success: false, error: "Actividad sospechosa detectada.", status: 403 };
        }
        return { success: true };
    } catch (err: any) {
        console.error("Error al chequear recaptcha: ", err);
        return { success: false, error: "Error inesperado.", status: 500 };
    }
}