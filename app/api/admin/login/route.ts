/*eslint-disable*/
import { NextResponse } from "next/server";
export async function POST(req: Request) {
    const body = await req.json();
    const { password } = body;
    if (typeof password !== "string" || !password.trim()) { 
        return NextResponse.json({ success: false, error: "La contraseña es requerida y debe ser un string." }, {status: 400});
    }
    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({success: false, error: "Contraseña incorrecta."}, {status: 401});
    }
    const res = NextResponse.json({success: true, message: "Sesión iniciada."}, {status: 200});
    res.cookies.set("admin_session", "active", {httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 4});
    console.log("Sesión iniciada."); 
    return res; 
}