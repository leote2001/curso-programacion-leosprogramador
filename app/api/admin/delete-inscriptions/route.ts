/*eslint-disable*/
import { connectDb } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { Inscription } from "@/app/lib/models/inscription.model";
export async function GET() {
    try {
await connectDb();
await Inscription.deleteMany();
return NextResponse.json({success: true, message: "Todas las inscriptions eliminadas."}, {status: 200});
    } catch (err: any) {
        console.error(`Error inesperado al eliminar todas las inscriptions de la db: ${err.message}`, err);
        return NextResponse.json({success: false, error: "Error inesperado al eliminar todas las inscriptions de la db."}, {status: 500});
    }
}