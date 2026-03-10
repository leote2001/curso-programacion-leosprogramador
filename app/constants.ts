/*eslint-disable*/
import axios from "axios";
export const axiosReq = axios.create({
    withCredentials: true,
    headers: {"Content-Type": "application/json"}
});

export const publicRecaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string;
export const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY as string;