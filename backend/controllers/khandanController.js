import khandanModel from "../models/khandanModel.js";

// API to get all khandans
const getAllKhandans = async (req, res) => {
  try {
    const khandans = await khandanModel
      .find({})
      .select("khandan contact address")
      .sort({ khandan: 1 }); // Sort alphabetically by khandan name

    if (!khandans || khandans.length === 0) {
      return res.json({
        success: false,
        message: "No khandans found",
        khandans: [],
      });
    }

    res.json({
      success: true,
      message: "Khandans fetched successfully",
      khandans: khandans,
    });
  } catch (error) {
    console.error("Error fetching khandans:", error);
    res.json({
      success: false,
      message: "Failed to fetch khandans: " + error.message,
      khandans: [],
    });
  }
};

// API to get a specific khandan by ID
const getKhandanById = async (req, res) => {
  try {
    const { khandanId } = req.params;

    if (!khandanId) {
      return res.json({
        success: false,
        message: "Khandan ID is required",
      });
    }

    const khandan = await khandanModel.findById(khandanId);

    if (!khandan) {
      return res.json({
        success: false,
        message: "Khandan not found",
      });
    }

    res.json({
      success: true,
      message: "Khandan fetched successfully",
      khandan: khandan,
    });
  } catch (error) {
    console.error("Error fetching khandan:", error);
    res.json({
      success: false,
      message: "Failed to fetch khandan: " + error.message,
    });
  }
};

// API to create a new khandan (admin only)
const createKhandan = async (req, res) => {
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
    const existingKhandan = await khandanModel.findOne({
      khandan: { $regex: new RegExp(`^${khandan}$`, "i") },
    });

    if (existingKhandan) {
      return res.json({
        success: false,
        message: "Khandan with this name already exists",
      });
    }

    // Create new khandan
    const newKhandan = new khandanModel({
      khandan,
      contact: contact || {
        mobileno: {
          code: "+91",
          number: "0000000000",
        },
      },
      address: address || {
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
    });

    const savedKhandan = await newKhandan.save();

    res.json({
      success: true,
      message: "Khandan created successfully",
      khandan: savedKhandan,
    });
  } catch (error) {
    console.error("Error creating khandan:", error);
    res.json({
      success: false,
      message: "Failed to create khandan: " + error.message,
    });
  }
};

// API to update a khandan (admin only)
const updateKhandan = async (req, res) => {
  try {
    const { khandanId } = req.params;
    const { khandan, contact, address } = req.body;

    if (!khandanId) {
      return res.json({
        success: false,
        message: "Khandan ID is required",
      });
    }

    // Check if khandan exists
    const existingKhandan = await khandanModel.findById(khandanId);
    if (!existingKhandan) {
      return res.json({
        success: false,
        message: "Khandan not found",
      });
    }

    // Prepare update data
    const updateData = {};
    if (khandan) updateData.khandan = khandan;
    if (contact)
      updateData.contact = { ...existingKhandan.contact, ...contact };
    if (address)
      updateData.address = { ...existingKhandan.address, ...address };

    // Update khandan
    const updatedKhandan = await khandanModel.findByIdAndUpdate(
      khandanId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Khandan updated successfully",
      khandan: updatedKhandan,
    });
  } catch (error) {
    console.error("Error updating khandan:", error);
    res.json({
      success: false,
      message: "Failed to update khandan: " + error.message,
    });
  }
};

// API to delete a khandan (admin only)
const deleteKhandan = async (req, res) => {
  try {
    const { khandanId } = req.params;

    if (!khandanId) {
      return res.json({
        success: false,
        message: "Khandan ID is required",
      });
    }

    const deletedKhandan = await khandanModel.findByIdAndDelete(khandanId);

    if (!deletedKhandan) {
      return res.json({
        success: false,
        message: "Khandan not found",
      });
    }

    res.json({
      success: true,
      message: "Khandan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting khandan:", error);
    res.json({
      success: false,
      message: "Failed to delete khandan: " + error.message,
    });
  }
};

export {
  getAllKhandans,
  getKhandanById,
  createKhandan,
  updateKhandan,
  deleteKhandan,
};
