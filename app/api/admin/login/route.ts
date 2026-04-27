/*eslint-disable*/
import { checkRateLimit } from "@/app/lib/ratelimit";
import { checkRecaptcha } from "@/app/lib/recaptcha";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
    const body = await req.json();
    const { user, password, token } = body;
    if (!token) {
        return NextResponse.json({success: false, error: "Se requiere token de seguridad."}, {status: 400});
    }
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const {success: rateLimitSuccess, error: rateLimitError, status: rateLimitStatus} = await checkRateLimit(ip);
    if (!rateLimitSuccess) {
        return NextResponse.json({success: false, error: rateLimitError}, {status: rateLimitStatus});
    }
    const {success, error, status} = await checkRecaptcha(token, "login_submit"); 
    if (!success) {
        return NextResponse.json({success: false, error}, {status});
    }
    if (typeof password !== "string" || !password.trim() || typeof user !== "string" || !user.trim()) { 
        return NextResponse.json({ success: false, error: "Se requiere usuario y contraseña. Ambos deben ser un string." }, {status: 400});
    }
    if (password !== process.env.ADMIN_PASSWORD || user !== process.env.ADMIN_USER) {
        return NextResponse.json({success: false, error: "Usuario o contraseña incorrectos."}, {status: 401});
    }
    const res = NextResponse.json({success: true, message: "Sesión iniciada."}, {status: 200});
    res.cookies.set("admin_session", "active", {httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 4});
    console.log("Sesión iniciada."); 
    return res; 
}