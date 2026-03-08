import { connectDb } from "@/app/lib/db";
import { CourseEdition } from "@/app/lib/models/courseEdition.model";
import { updateCourseEditionSchema } from "@/app/lib/zodSchemas";
import mongoose from "mongoose";
import {Inscription} from "@/app/lib/models/inscription.model";
import { NextResponse } from "next/server";

/*eslint-disable*/
export async function GET(req: Request, { params }: { params: { courseEditionId: string } }) {
    const { courseEditionId } = params;
    try {
        await connectDb();
        const existingCourseEdition = await CourseEdition.findById(courseEditionId);
        if (!existingCourseEdition) {
            return NextResponse.json({ success: false, error: "No se encontró cohorte." }, { status: 404 });
        }
        console.log("Cohorte encontrada.");
        return NextResponse.json({ success: true, message: "Cohorte encontrada.", courseEdition: existingCourseEdition }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al obtener cohorte.");
        return NextResponse.json({ success: false, error: "Error inesperado al obtener cohorte." }, { status: 500 });
    }
}
export async function PUT(req: Request, { params }: { params: { courseEditionId: string } }) {
    let preParsed;
    const { courseEditionId } = await params;
    const body = await req.json();
    if (Object.keys(body).length == 1 && body.status) {
        preParsed = {status: body.status}; 
    } else { 
    preParsed = {...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate)};
    }
    const parsed = updateCourseEditionSchema.safeParse(preParsed);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    try {
        await connectDb();
        const existingCourseEdition = await CourseEdition.findById(courseEditionId);
        if (!existingCourseEdition) {
            return NextResponse.json({ success: false, error: "No se encontró cohorte." }, { status: 404 });
        }
        const allowedTransitions: any = {
            upcoming: ["upcoming", "open", "canceled"],
            open: ["open", "active", "upcoming", "canceled"],
            active: ["active", "finished"]
        }
        const start = data.startDate ?? existingCourseEdition.startDate;
        const enrolled = existingCourseEdition.studentsQuantity;
        const end = data.endDate ?? existingCourseEdition.endDate;
        const currentStatus = existingCourseEdition.status;
        const nextStatus = data.status ?? currentStatus;
        if (currentStatus === "finished" || currentStatus === "canceled") return NextResponse.json({ success: false, error: "No se pueden modificar cohortes finalizadas o canceladas." }, { status: 400 });
        if (start >= end || start < new Date()) return NextResponse.json({ success: false, error: "La fecha de inicio tiene que ser anterior a la fecha de finalización y no ser anterior a la fecha actual." }, { status: 400 });
        if (data.status && !allowedTransitions[currentStatus].includes(data.status)) return NextResponse.json({ success: false, error: `No se puede cambiar ${currentStatus} a ${data.status}.` }, { status: 400 });
        if (currentStatus === "upcoming") {
            if (nextStatus === "open") {
                const searchOpen = await CourseEdition.findOne({ status: "open", _id: { $ne: existingCourseEdition._id } });
                if (searchOpen) return NextResponse.json({ success: false, error: "Ya hay una cohorte con inscripciones abiertas." }, { status: 400 });
            }
            Object.assign(existingCourseEdition, data);
        }
        if (currentStatus === "open") {
            if (nextStatus === "active") {
                if (enrolled == 0) return NextResponse.json({success: false, error: "No se puede pasar a active porque no hay alumnos todavía."}, {status: 400});
                const active = await CourseEdition.findOne({ status: "active", _id: { $ne: existingCourseEdition._id } });
                if (active) return NextResponse.json({ success: false, error: "Ya hay una cohorte activa." }, { status: 400 });
            }
            if (enrolled > 0) {
                if (data.status && data.status === "upcoming" || data.status && data.status === "canceled") return NextResponse.json({ success: false, error: "No se puede cambiar a upcoming o a canceled porque ya hay alumnos inscriptos en la cohorte." }, { status: 400 });
                if (data.googleMeetUrl) existingCourseEdition.googleMeetUrl = data.googleMeetUrl;
                if (data.status) existingCourseEdition.status = data.status;
            } else {
                Object.assign(existingCourseEdition, data);
            }
        }
        if (currentStatus === "active") {
            if (data.googleMeetUrl) existingCourseEdition.googleMeetUrl = data.googleMeetUrl;
            if (nextStatus === "finished") existingCourseEdition.status = "finished";
        }
        await existingCourseEdition.save();
        console.log("Cohorte actualizada.");
        return NextResponse.json({ success: true, message: "Cohorte actualizada.", updatedCourseEdition: existingCourseEdition }, { status: 200 });
    } catch (err: any) {
        console.error("Error inesperado al actualizar cohorte: "+err);
        return NextResponse.json({ success: false, error: "Error inesperado al actualizar cohorte." }, { status: 500 });
    }
}
export async function DELETE(req: Request, { params }: { params: { courseEditionId: string } }) {
    let session;
    let errorCode = null;
    const { courseEditionId } = await params;
    try {
        await connectDb();
        session = await mongoose.startSession();
        session.startTransaction();
        const existingCourseEdition = await CourseEdition.findById(courseEditionId).session(session);
        if (!existingCourseEdition) {
            errorCode = 404;
            throw new Error("No se encontró cohorte.");
        }
        if (existingCourseEdition.status === "active" || existingCourseEdition.studentsQuantity > 0 && existingCourseEdition.status != "finished") {
            errorCode = 400;
            throw new Error("No se puede eliminar una cohorte activa o con alumnos inscriptos.");
        }
        await Inscription.deleteMany({courseEdition: courseEditionId}, {session});
        await existingCourseEdition.deleteOne({session});
        await session.commitTransaction();
        console.log("Cohorte eliminada y sus inscripciones también.");
        return NextResponse.json({ success: true, message: "Cohorte eliminada." }, { status: 200 });
    } catch (err: any) {
        console.error("Error al eliminar cohorte: " + err);
        if (session && session.transaction && session.transaction.isActive) {
            await session.abortTransaction();
        }
        return NextResponse.json({ success: false, error: err.message || "Error inesperado al eliminar cohorte."}, { status: errorCode || 500});
    } finally {
        session?.endSession();
    }
}