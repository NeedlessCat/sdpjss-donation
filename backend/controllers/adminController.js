import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import noticeModel from "../models/noticeModel.js";
import donationModel from "../models/donationModel.js";
import khandanModel from "../models/khandanModel.js";
import donationCategoryModel from "../models/donationCategoryModel.js";

//API for admin login..
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// NEW: API to get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get total counts
    const totalKhandans = await khandanModel.countDocuments();
    const totalUsers = await userModel.countDocuments();
    const totalDonations = await donationModel.countDocuments();
    console.log(totalDonations, totalKhandans, totalUsers);

    // Get total donation amount
    const donationStats = await donationModel.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalDonationAmount =
      donationStats.length > 0 ? donationStats[0].totalAmount : 0;

    // Get monthly data for the selected year
    const monthlyData = await Promise.all([
      getMonthlyKhandanData(currentYear),
      getMonthlyUserData(currentYear),
      getMonthlyDonationData(currentYear),
    ]);

    const [khandanMonthly, userMonthly, donationMonthly] = monthlyData;

    // Combine monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const combinedMonthlyData = months.map((month, index) => {
      const khandanData = khandanMonthly.find(
        (item) => item.month === index + 1
      );
      const userData = userMonthly.find((item) => item.month === index + 1);
      const donationData = donationMonthly.find(
        (item) => item.month === index + 1
      );

      return {
        month,
        families: khandanData ? khandanData.count : 0,
        users: userData ? userData.count : 0,
        donations: donationData ? donationData.amount : 0,
        donationCount: donationData ? donationData.count : 0,
      };
    });

    res.json({
      success: true,
      stats: {
        totalKhandans,
        totalUsers,
        totalDonations,
        totalDonationAmount,
        monthlyData: combinedMonthlyData,
      },
    });
  } catch (error) {
    console.log("Error in getDashboardStats:", error);
    res.json({ success: false, message: error.message });
  }
};

// Helper function to get monthly khandan data
const getMonthlyKhandanData = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  try {
    const monthlyKhandans = await khandanModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return monthlyKhandans;
  } catch (error) {
    console.log("Error in getMonthlyKhandanData:", error);
    // If there's an error (like createdAt field doesn't exist), return empty array
    return [];
  }
};

// Helper function to get monthly user data
const getMonthlyUserData = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  try {
    const monthlyUsers = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return monthlyUsers;
  } catch (error) {
    console.log("Error in getMonthlyUserData:", error);
    // If there's an error (like createdAt field doesn't exist), return empty array
    return [];
  }
};

// Helper function to get monthly donation data
const getMonthlyDonationData = async (year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  try {
    const monthlyDonations = await donationModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          amount: 1,
          _id: 0,
        },
      },
    ]);

    return monthlyDonations;
  } catch (error) {
    console.log("Error in getMonthlyDonationData:", error);
    // If there's an error, return empty array
    return [];
  }
};
// NEW: API to get khandan count with monthly breakdown
const getKhandanCount = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const totalCount = await khandanModel.countDocuments();
    const monthlyData = await getMonthlyKhandanData(currentYear);

    // Format monthly data for frontend
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyData = months.map((month, index) => {
      const data = monthlyData.find((item) => item.month === index + 1);
      return {
        month,
        families: data ? data.count : 0,
      };
    });

    res.json({
      success: true,
      totalCount,
      monthlyData: formattedMonthlyData,
      message: "Khandan count retrieved successfully",
    });
  } catch (error) {
    console.log("Error in getKhandanCount:", error);
    res.json({ success: false, message: error.message });
  }
};

// --------------------------

// API to add a new khandan
const addKhandan = async (req, res) => {
  try {
    const { khandan, contact, address } = req.body;

    // Validate required fields
    if (!khandan) {
      return res.json({
        success: false,
        message: "Khandan name is required",
      });
    }

    // Check if khandan already exists
    const existingKhandan = await khandanModel.findOne({ khandan });
    if (existingKhandan) {
      return res.json({
        success: false,
        message: "Khandan already exists",
      });
    }

    const newKhandan = new khandanModel({
      khandan,
      contact,
      address,
    });

    await newKhandan.save();

    res.json({
      success: true,
      khandan: newKhandan,
      message: "Khandan added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update a khandan
const updateKhandan = async (req, res) => {
  try {
    console.log("Khandan", req.params);
    const { id } = req.params;
    const { khandan, contact, address } = req.body;

    // Validate required fields
    if (!khandan) {
      return res.json({
        success: false,
        message: "Khandan name is required",
      });
    }

    const updatedKhandan = await khandanModel.findByIdAndUpdate(
      id,
      {
        khandan,
        contact,
        address,
      },
      { new: true }
    );

    if (!updatedKhandan) {
      return res.json({ success: false, message: "Khandan not found" });
    }

    res.json({
      success: true,
      khandan: updatedKhandan,
      message: "Khandan updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a khandan
const deleteKhandan = async (req, res) => {
  try {
    console.log("Khandan", req.params);
    const { id } = req.params;

    const deletedKhandan = await khandanModel.findByIdAndDelete(id);

    if (!deletedKhandan) {
      return res.json({ success: false, message: "Khandan not found" });
    }

    res.json({
      success: true,
      message: "Khandan deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get khandan list with count
const getKhandanList = async (req, res) => {
  try {
    const khandanList = await khandanModel.find({});
    const count = khandanList.length;

    res.json({
      success: true,
      khandanList,
      count,
      message: "Khandan list retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------------

// API to get user list with count and filtering
const getUserList = async (req, res) => {
  try {
    const {
      search,
      gender,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    let filter = {};

    // Add search filter for name
    if (search) {
      filter.fullname = { $regex: search, $options: "i" };
    }

    // Add gender filter
    if (gender && gender !== "all") {
      filter.gender = gender;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const users = await userModel
      .find(filter)
      .select("-password")
      .populate("khandanid", "khandan") // Updated to match your schema
      .sort(sort);

    const count = users.length;

    // Get statistics
    const stats = {
      total: count,
      male: users.filter((user) => user.gender === "male").length,
      female: users.filter((user) => user.gender === "female").length,
      other: users.filter((user) => user.gender === "other").length,
    };

    res.json({
      success: true,
      users,
      count,
      stats,
      message: `Retrieved ${count} users successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user count with gender breakdown
const getUserCount = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const totalUsers = await userModel.countDocuments();
    const maleUsers = await userModel.countDocuments({ gender: "male" });
    const femaleUsers = await userModel.countDocuments({ gender: "female" });
    const otherUsers = await userModel.countDocuments({ gender: "other" });

    // Get monthly data for the year
    const monthlyData = await getMonthlyUserData(currentYear);

    // Format monthly data for frontend
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyData = months.map((month, index) => {
      const data = monthlyData.find((item) => item.month === index + 1);
      return {
        month,
        completeUsers: data ? Math.floor(data.count * 0.8) : 0, // Mock complete users
        incompleteUsers: data ? Math.floor(data.count * 0.2) : 0, // Mock incomplete users
      };
    });

    res.json({
      success: true,
      totalUsers,
      maleUsers,
      femaleUsers,
      otherUsers,
      monthlyData: formattedMonthlyData,
      message: "User count retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Updated getDonationList function with proper population
const getDonationList = async (req, res) => {
  try {
    const donations = await donationModel
      .find()
      .populate({
        path: "userId",
        select: "fullname email khandanid",
        populate: {
          path: "khandanid",
          select: "khandan",
        },
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getDonationList:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get donation statistics with filtering
const getDonationStats = async (req, res) => {
  try {
    const { year, month, khandan, userId, isPacket } = req.query;

    // Build filter object
    let filter = {};

    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: startOfYear, $lte: endOfYear };
    }

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (userId) {
      filter.userId = userId;
    }

    // Get donations with population
    let donations = await donationModel
      .find(filter)
      .populate({
        path: "userId",
        select: "fullname email khandanid",
        populate: {
          path: "khandanid",
          select: "khandan",
        },
      })
      .sort({ date: -1 });

    // Filter by khandan if specified
    if (khandan) {
      donations = donations.filter(
        (donation) =>
          donation.userId.khandanid &&
          donation.userId.khandanid._id.toString() === khandan
      );
    }

    // Filter by packet type if specified
    if (isPacket !== undefined) {
      const packetFilter = isPacket === "true";
      donations = donations.filter((donation) => {
        const hasPacketItems = donation.list.some(
          (item) => item.isPacket === true
        );
        return packetFilter ? hasPacketItems : !hasPacketItems;
      });
    }

    // Calculate statistics
    const totalDonations = donations.length;
    const completedDonations = donations.filter(
      (d) => d.paymentStatus === "completed"
    ).length;
    const totalAmount = donations
      .filter((d) => d.paymentStatus === "completed")
      .reduce((sum, d) => sum + d.amount, 0);
    const totalCourierCharges = donations
      .filter((d) => d.paymentStatus === "completed")
      .reduce((sum, d) => sum + d.courierCharge, 0);
    const packetDonations = donations.filter((d) =>
      d.list.some((item) => item.isPacket === true)
    ).length;
    const nonPacketDonations = totalDonations - packetDonations;

    // Get unique donors
    const uniqueDonors = [
      ...new Set(donations.map((d) => d.userId._id.toString())),
    ];
    const totalDonors = uniqueDonors.length;

    // Get category wise breakdown
    const categoryBreakdown = {};
    donations.forEach((donation) => {
      donation.list.forEach((item) => {
        if (!categoryBreakdown[item.category]) {
          categoryBreakdown[item.category] = {
            totalAmount: 0,
            totalQuantity: 0,
            donations: 0,
          };
        }
        categoryBreakdown[item.category].totalAmount += item.amount;
        categoryBreakdown[item.category].totalQuantity += item.quantity || 1;
        categoryBreakdown[item.category].donations += 1;
      });
    });

    res.json({
      success: true,
      stats: {
        totalDonations,
        completedDonations,
        totalAmount,
        totalCourierCharges,
        packetDonations,
        nonPacketDonations,
        totalDonors,
        categoryBreakdown,
      },
      donations,
    });
  } catch (error) {
    console.log("Error in getDonationStats:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get available years from donations
const getAvailableYears = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Get the earliest donation year
    const earliestDonation = await donationModel
      .findOne({})
      .sort({ date: 1 })
      .select("date");

    // Get the earliest user year
    const earliestUser = await userModel
      .findOne({})
      .sort({ createdAt: 1 })
      .select("createdAt");

    // Get the earliest khandan year
    const earliestKhandan = await khandanModel
      .findOne({})
      .sort({ createdAt: 1 })
      .select("createdAt");

    let startYear = 2024; // Default start year

    // Find the earliest year from all sources
    if (earliestDonation?.date) {
      startYear = Math.min(startYear, earliestDonation.date.getFullYear());
    }
    if (earliestUser?.createdAt) {
      startYear = Math.min(startYear, earliestUser.createdAt.getFullYear());
    }
    if (earliestKhandan?.createdAt) {
      startYear = Math.min(startYear, earliestKhandan.createdAt.getFullYear());
    }

    // Generate array of years from start year to current year
    const years = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }

    res.json({
      success: true,
      years: years.reverse(), // Most recent first
      message: `Available years: ${startYear} to ${currentYear}`,
    });
  } catch (error) {
    console.log("Error in getAvailableYears:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all notices
const getNoticeList = async (req, res) => {
  try {
    const notices = await noticeModel.find({}).sort({ createdAt: -1 }); // Most recent first

    const count = notices.length;

    res.json({
      success: true,
      notices,
      count,
      message: `Retrieved ${count} notices successfully`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new notice
const addNotice = async (req, res) => {
  try {
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const newNotice = new noticeModel({
      title,
      message,
      icon,
      color,
      type,
      author,
      category,
      time: new Date(), // Set current time
    });

    await newNotice.save();

    res.json({
      success: true,
      notice: newNotice,
      message: "Notice added successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update a notice
const updateNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;
    const { title, message, icon, color, type, author, category } = req.body;

    // Validate required fields
    if (
      !title ||
      !message ||
      !icon ||
      !color ||
      !type ||
      !author ||
      !category
    ) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate type enum
    const validTypes = [
      "alert",
      "announcement",
      "event",
      "achievement",
      "info",
    ];
    if (!validTypes.includes(type)) {
      return res.json({
        success: false,
        message: "Invalid notice type",
      });
    }

    const updatedNotice = await noticeModel.findByIdAndUpdate(
      id,
      {
        title,
        message,
        icon,
        color,
        type,
        author,
        category,
      },
      { new: true }
    );

    if (!updatedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      notice: updatedNotice,
      message: "Notice updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete a notice
const deleteNotice = async (req, res) => {
  try {
    console.log("Notice", req.params);
    const { id } = req.params;

    const deletedNotice = await noticeModel.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.json({ success: false, message: "Notice not found" });
    }

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await donationCategoryModel.find({ isActive: true });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { categoryName, rate, weight, packet, description } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!categoryName || !rate || !(weight || packet)) {
      return res.json({
        success: false,
        message: "Category name, rate, and weight are required",
      });
    }

    // Check if category already exists
    const existingCategory = await donationCategoryModel.findOne({
      categoryName: categoryName.trim(),
    });

    if (existingCategory) {
      return res.json({
        success: false,
        message: "Category already exists",
      });
    }

    // Create new category
    const newCategory = new donationCategoryModel({
      categoryName: categoryName.trim(),
      rate: Number(rate),
      weight: Number(weight),
      packet: Boolean(packet),
      description: description?.trim() || "",
    });

    const savedCategory = await newCategory.save();

    res.json({
      success: true,
      message: "Category added successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Edit category
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, rate, weight, packet, description } = req.body;

    // Validate required fields
    if (!categoryName || !rate || !weight) {
      return res.json({
        success: false,
        message: "Category name, rate, and weight are required",
      });
    }

    // Check if category exists
    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if another category with same name exists
    const existingCategory = await donationCategoryModel.findOne({
      categoryName: categoryName.trim(),
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.json({
        success: false,
        message: "Category name already exists",
      });
    }

    // Update category
    const updatedCategory = await donationCategoryModel.findByIdAndUpdate(
      id,
      {
        categoryName: categoryName.trim(),
        rate: Number(rate),
        weight: Number(weight),
        packet: Boolean(packet),
        description: description?.trim() || "",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete category (soft delete)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    // Soft delete by setting isActive to false
    await donationCategoryModel.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await donationCategoryModel.findById(id);
    if (!category) {
      return res.json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginAdmin,
  getUserList,
  getUserCount,
  getNoticeList,
  addNotice,
  updateNotice,
  deleteNotice,
  addKhandan,
  updateKhandan,
  deleteKhandan,
  getKhandanList,
  getKhandanCount,
  getDonationList,
  getDonationStats,
  getAvailableYears,
  getAllCategories,
  addCategory,
  editCategory,
  deleteCategory,
  getCategory,
  getDashboardStats,
};
