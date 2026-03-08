import { NextResponse } from "next/server";

export async function POST() {
const res = NextResponse.json({success: true, message: "Sesión cerrada."}, {status: 200});
res.cookies.delete("admin_session");
console.log("Sesión cerrada.");
return res;
}