"use client";
import { publicRecaptchaKey } from "../constants";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ReactNode } from "react";

interface RecaptchaProviderProps {
    children: ReactNode;
}
export default function RecaptchaProvider({children}: RecaptchaProviderProps) {
 return (
<GoogleReCaptchaProvider reCaptchaKey={publicRecaptchaKey}>
    {children}
</GoogleReCaptchaProvider>
 );   
}