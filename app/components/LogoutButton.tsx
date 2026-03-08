"use client";
/*eslint-disable*/
import { useState } from "react";
import { axiosReq } from "../constants";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const [error, setError] = useState("");
    const router = useRouter();
    const onLogout = async () => {
        try {
setError("");
await axiosReq.post("/api/admin/logout");
router.push("/admin/login");
        } catch (err: any) {
            setError(err.response.data.error || "Error al cerrar sesión.");
        }
    } 
    return (
        <>
        {!error ?
<button onClick={() => onLogout()}>Logout</button>
:
<p role="alert" aria-live="assertive">{error}</p>
}
</>
    );
}