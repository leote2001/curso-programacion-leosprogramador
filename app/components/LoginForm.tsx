/*eslint-disable*/
"use client";
import { FormEvent, useState } from "react";
import { axiosReq } from "../constants";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axiosReq.post("/api/admin/login", {password});
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