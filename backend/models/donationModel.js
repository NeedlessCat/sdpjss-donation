import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    list: [
      {
        category: String,
        number: Number,
        amount: Number,
        isPacket: Boolean,
        quantity: Number,
      },
    ],
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["Cash", "Online"],
      required: true,
    },
    courierCharge: { type: Number, required: true },
    razorpayOrderId: { type: String },
    transactionId: { type: String }, // if digital payment
    date: { type: Date, default: Date.now },
    remarks: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    postalAddress: { type: String, required: true },
  },
  { timestamps: true }
);

const donationModel =
  mongoose.models.donation || mongoose.model("donation", donationSchema);

export default donationModel;
