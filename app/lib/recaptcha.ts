/*eslint-disable*/
import { recaptchaSecretKey } from "../constants";
import axios from "axios";

export const checkRecaptcha = async (token: string, action: string) => {
    try {
const verifyRes = await axios.post("https://www.google.com/recaptcha/api/siteverify", {
    headers: {
        "Content-Type": "x-www-form-urlencoded"
    },
    body: `secret=${recaptchaSecretKey}&response=${token}`
});
console.log("recaptchaScore: "+verifyRes.data.score);
if (!verifyRes.data.success || verifyRes.data.score < 0.5 || verifyRes.data.action !== action) {
    return {success: false, error: "Actividad sospechosa detectada.", status: 403};
}
return {success: true};
    } catch (err: any) {
        console.error("Error al chequear recaptcha: ",err);
        return {success: false, error: "Error inesperado.", status: 500};
    }
}