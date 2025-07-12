import express from "express";
import upload from "../middlewares/multer.js";
import {
  addCategory,
  addKhandan,
  addNotice,
  deleteCategory,
  deleteKhandan,
  deleteNotice,
  editCategory,
  getAllCategories,
  getAvailableYears,
  getCategory,
  getDashboardStats,
  getDonationList,
  getDonationStats,
  getKhandanCount,
  getKhandanList,
  getNoticeList,
  getUserCount,
  getUserList,
  loginAdmin,
  updateKhandan,
  updateNotice,
} from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  addTeamMember,
  deleteTeamMember,
  getAllTeamMembersForAdmin,
  toggleTeamMemberStatus,
  updateTeamMember,
} from "../controllers/teamController.js";
import {
  createDonationOrder,
  registerUser,
  verifyDonationPayment,
} from "../controllers/userController.js";

const adminRouter = express.Router();

// Authentication
adminRouter.post("/login", loginAdmin);

// Dashboard
adminRouter.get("/dashboard-stats", authAdmin, getDashboardStats);

// User management
adminRouter.get("/user-list", authAdmin, getUserList);
adminRouter.get("/user-count", authAdmin, getUserCount);
adminRouter.post("/register", upload.none(), registerUser);

// Notice management
adminRouter.get("/notice-list", authAdmin, getNoticeList);
adminRouter.post("/add-notice", authAdmin, addNotice);
adminRouter.put("/update-notice/:id", authAdmin, updateNotice);
adminRouter.delete("/delete-notice/:id", authAdmin, deleteNotice);

// Khandan (Family) management
adminRouter.get("/khandan-list", authAdmin, getKhandanList);
adminRouter.get("/khandan-count", authAdmin, getKhandanCount);
adminRouter.post("/add-khandan", authAdmin, addKhandan);
adminRouter.put("/update-khandan/:id", authAdmin, updateKhandan);
adminRouter.delete("/delete-khandan/:id", authAdmin, deleteKhandan);

// Donation management
adminRouter.get("/donation-list", authAdmin, getDonationList);
adminRouter.get("/donation-stats", authAdmin, getDonationStats);
adminRouter.post(
  "/create-donation-order",
  upload.none(),
  authAdmin,
  createDonationOrder
);
adminRouter.post(
  "/verify-donation-payment",
  upload.none(),
  authAdmin,
  verifyDonationPayment
);

// Category management
adminRouter.get("/categories", getAllCategories);
adminRouter.post("/categories", addCategory);
adminRouter.get("/categories/:id", getCategory);
adminRouter.put("/categories/:id", editCategory);
adminRouter.delete("/categories/:id", deleteCategory);

// Team management
adminRouter.get("/all-team-members", authAdmin, getAllTeamMembersForAdmin);
adminRouter.post(
  "/add-team-member",
  authAdmin,
  upload.single("image"),
  addTeamMember
);
adminRouter.put(
  "/update-team-member/:id",
  authAdmin,
  upload.single("image"),
  updateTeamMember
);
adminRouter.delete("/delete-team-member/:id", authAdmin, deleteTeamMember);
adminRouter.put("/team-members/status", authAdmin, toggleTeamMemberStatus);

// Utility routes
adminRouter.get("/available-years", authAdmin, getAvailableYears);

export default adminRouter;
