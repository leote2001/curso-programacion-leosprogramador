import mongoose , {Document} from "mongoose";
export interface IPayment extends Document {
paymentId: string;
paymentDate: Date;
payerEmail: string;    
externalReference: string;
currency: string;
amountPaid: number;
paymentMethod: string; 
paymentStatus: string;
feeDetails: {amount?: number, percent?: number, type?:string};
netReceived: number;
refundReason: string;
refundDate: Date | null;
}
const paymentSchema = new mongoose.Schema<IPayment>({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    payerEmail: {
        type: String,
        required: true
    },
  externalReference: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true
  },
  feeDetails: {
    amount: {type: Number},
    percent: {type: Number},
    type: {type: String, default: "mercadopago_fee"}    
  },
  netReceived: {
    type: Number,
    required: true
  },
  refundDate: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    default: ""
  }  
}, {
    timestamps: true
});
export const Payment = mongoose.model("Payment", paymentSchema);