import mongoose, {Document} from "mongoose";
export interface ICourseEdition extends Document {
name: string;
startDate: Date;
endDate: Date;
priceARS: number;
priceUSD: number;
startTime: string;
googleMeetUrl: string;
studentsQuantity: number;
maxStudents: number;
status: "upcoming" | "open" | "active" | "finished" | "canceled";
}
const courseEditionSchema = new mongoose.Schema<ICourseEdition>({
    name: {
        type: String,
        required: true,
        default: "Intro a la programación"
    },
    priceARS: {
        type: Number,
        required: true
    },
    priceUSD: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true 
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    googleMeetUrl: {
        type: String,
        default: ""
    },
    studentsQuantity: {
        type: Number,
        default: 0
    },
    maxStudents: {
        type: Number,
        default: 12
    },
    status: {
        type: String,
        enum: ["upcoming", "open", "active", "finished", "canceled"],
        default: "upcoming" 
    }
}, {
    timestamps: true
});
export const CourseEdition = mongoose.models.CourseEdition || mongoose.model("CourseEdition", courseEditionSchema);