import express from "express";
import upload from "../middlewares/multer.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  createDonationOrder,
  verifyDonationPayment,
  getUserDonations,
  changePassword,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import {
  getAllCategories,
  getCategory,
} from "../controllers/adminController.js";

const userRouter = express.Router();

// Authentication Routes
userRouter.post("/register", upload.none(), registerUser);
userRouter.post("/login", upload.none(), loginUser);

// Profile Routes
userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post("/update-profile", upload.none(), authUser, updateUserProfile);

// Donation Routes
userRouter.post(
  "/create-donation-order",
  upload.none(),
  authUser,
  createDonationOrder
);

userRouter.post(
  "/verify-donation-payment",
  upload.none(),
  authUser,
  verifyDonationPayment
);

userRouter.get("/my-donations", authUser, getUserDonations);
userRouter.post("/change-password", authUser, changePassword);

userRouter.get("/categories", getAllCategories);
userRouter.get("/categories/:id", getCategory);

export default userRouter;
