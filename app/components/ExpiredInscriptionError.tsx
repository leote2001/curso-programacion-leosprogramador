"use client";
import Link from "next/link";
export default function ExpiredInscriptionError() {
    return (
        <>
        <h2>La preinscripción ya expiró</h2>
            <p><Link href={"/preinscription"}>Volver a preinscribirse</Link></p>
        </>
    );
}