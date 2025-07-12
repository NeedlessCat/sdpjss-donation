import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      default: "username.1234",
    },
    password: {
      type: String,
      default: "qwerty123",
    },
    khandanid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "khandan",
    },
    contact: {
      type: Object,
      default: {
        email: "",
        mobileno: {
          code: "+91",
          number: "0000000000",
        },
        whatsappno: "",
      },
    },
    address: {
      type: Object,
      default: {
        currlocation: "",
        country: "",
        state: "",
        district: "",
        city: "",
        postoffice: "",
        pin: "",
        landmark: "",
        street: "",
        apartment: "",
        floor: "",
        room: "",
      },
    },
    profession: {
      type: Object,
      default: {
        category: "",
        job: "",
        specialization: "",
      },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
