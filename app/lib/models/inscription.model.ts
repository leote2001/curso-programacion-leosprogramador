import mongoose, { Document } from "mongoose";
export interface IInscription extends Document {
  fullName: string;
  email: string;
  country: string;
  phone?: string;
  comment?: string;
  priceARS: number;
  priceUSD: number;
  expiresAt: Date;
  paymentMethod: "mercadopago" | "paypal" | "none";
  paypalOrderId: string;
  paymentStatus: "pending" | "approved" | "rejected";
  paymentMessage: string;
  paymentId?: string;
  paymentDate?: Date;
  amountPaid: number;
  currency: "ARS" | "USD" | "NONE";

  createdAt?: string;
  updatedAt?: string;
  courseEdition: mongoose.Schema.Types.ObjectId;
}
const inscriptionSchema = new mongoose.Schema<IInscription>(
  {
    fullName: {
      type: String,
      required: true,
      maxlength: [100, "No puede superar los 100 caracteres."],
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: [88, "No puede superar los 88 caracteres."],
    },

    country: {
      type: String,
      trim: true,
      maxlength: [88, "No puede superar los 88 caracteres."],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "No puede superar los 50 caracteres."],
      minlength: 5
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: [185, "No puede superar los 185 caracteres."]
    },
    priceARS: {
      type: Number,
      required: true
    },
    priceUSD: {
      type: Number,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["mercadopago", "paypal", "none"],
      default: "none",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paypalOrderId: {
      type: String,
      default: ""
    },
    paymentMessage: {
      type: String,
      default: ""
    },
    paymentId: {
      type: String,
      default: "",
    },

    paymentDate: {
      type: Date,
      default: null
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      enum: ["ARS", "USD", "NONE"],
      default: "NONE",
    },
    courseEdition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseEdition",
      required: true
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);
inscriptionSchema.index({ email: 1, courseEdition: 1 }, { unique: true });
export const Inscription = mongoose.models.Inscription || mongoose.model("Inscription", inscriptionSchema);
