/*eslint-disable*/
import axios from "axios";
import { calculateDollarPrice } from "./lib/calculateDollarPrice";
export const axiosReq = axios.create({
    withCredentials: true,
    headers: {"Content-Type": "application/json"}
});

export const publicRecaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string;
export const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY as string;
export const coursePrice = 40000;
export const priceWithDiscount = coursePrice - (coursePrice * 0.30);
export const priceInDollars = calculateDollarPrice(priceWithDiscount, 1366);
export const baseUrl = process.env.NEXT_PUBLIC_PP_BASE_URL; 