/*eslint-disable*/
"use client";
import { FormEvent, useState } from "react";
import { axiosReq } from "../constants";
import { useRouter } from "next/navigation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function LoginForm() {
    const {executeRecaptcha} = useGoogleReCaptcha();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!executeRecaptcha) return;
        setError("");
        try {
            const token = await executeRecaptcha("login_submit");
            const response = await axiosReq.post("/api/admin/login", {password, token});
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.response.data.error || "Error en la contraseña para iniciar sesión.");
        }
    }
    return (
        <>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="password">Password</label>
                    <input id="password" autoFocus type="password" required name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Ingresar</button>
                {error &&
                    <p role="alert" aria-live="assertive">{error}</p>
                }
            </form>
        </>
    );
}