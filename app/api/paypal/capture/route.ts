/*eslint-disable*/
import { capture } from "@/app/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;
        const payCapture = await capture(orderId);
        if (!payCapture.success) {
            return NextResponse.json({ success: false, error: payCapture.error || "Error al capturar pago de Paypal." }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: payCapture.message || "Pago de Paypal capturado." }, { status: 200 });
    } catch (err: any) {
console.error("Error inesperado en capture de paypal: "+err);
return NextResponse.json({success: false, error: "Error inesperado en capture de Paypal."}, {status: 500});
    }
}