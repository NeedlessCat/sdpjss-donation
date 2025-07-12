import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";
import donationModel from "../models/donationModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import razorpay from "razorpay";
import puppeteer from "puppeteer";

// Initialize Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to generate random password
const generateRandomPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to generate username from fullname and dob
const generateUsername = (fullname, dob) => {
  const firstName = fullname.split(" ")[0].toLowerCase();
  const date = new Date(dob);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${firstName}${day}${month}${year}`;
};

// Function to send SMS (you'll need to integrate with SMS service like Twilio)
const sendSMS = async (mobile, username, password) => {
  try {
    // Implement SMS sending logic here
    console.log(
      `SMS sent to ${mobile.code}${mobile.number}: Username: ${username}, Password: ${password}`
    );
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
};

// Function to send email
const sendEmail = async (email, username, password, fullname) => {
  try {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome! Your Account Credentials",
      html: `
        <h2>Welcome ${fullname}!</h2>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><em>Important: You can change your username and password anytime after logging in.</em></p>
        <p>Best regards,<br>Your Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

//-----------------------------------------------------------------------------

// API for user registration
const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const { fullname, gender, dob, khandanid, email, mobile, address } =
      req.body;

    // Validate required fields
    if (!fullname || !gender || !dob || !khandanid || !address) {
      return res.json({
        success: false,
        message:
          "Missing required details: fullname, gender, dob, khandanid, and address are required",
      });
    }

    // Validate that at least one contact method is provided
    const hasEmail = email && email.trim() !== "";
    const hasMobile = mobile && mobile.code && mobile.number;

    if (!hasEmail && !hasMobile) {
      return res.json({
        success: false,
        message: "At least one contact method (email or mobile) is required",
      });
    }

    // Validate email format if provided
    if (hasEmail && !validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate mobile number if provided
    if (
      hasMobile &&
      (typeof mobile !== "object" ||
        !mobile.code ||
        !mobile.number ||
        !/^\d{10}$/.test(mobile.number))
    ) {
      return res.json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      return res.json({
        success: false,
        message: "Gender must be 'male', 'female', or 'other'",
      });
    }

    // Validate date of birth
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.json({
        success: false,
        message: "Enter a valid date of birth",
      });
    }

    // Check if email already exists (if provided)
    if (hasEmail) {
      const existingUserByEmail = await userModel.findOne({
        "contact.email": email,
      });
      if (existingUserByEmail) {
        return res.json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Check if mobile already exists (if provided)
    if (hasMobile) {
      const existingUserByMobile = await userModel.findOne({
        "contact.mobileno.code": mobile.code,
        "contact.mobileno.number": mobile.number,
      });
      if (existingUserByMobile) {
        return res.json({
          success: false,
          message: "Mobile number already registered",
        });
      }
    }

    // Generate username and password
    const generatedUsername = generateUsername(fullname, dobDate);
    const generatedPassword = generateRandomPassword();

    // Check if username already exists, if so, add a number suffix
    let finalUsername = generatedUsername;
    let counter = 1;
    while (await userModel.findOne({ username: finalUsername })) {
      finalUsername = `${generatedUsername}${counter}`;
      counter++;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    // Prepare contact object
    const contactData = {
      email: hasEmail ? email : "",
      mobileno: hasMobile ? mobile : { code: "+91", number: "0000000000" },
      whatsappno: "",
    };

    // Create user data
    const userData = {
      fullname,
      gender: gender.toLowerCase(),
      dob: dobDate,
      username: finalUsername,
      password: hashedPassword,
      khandanid,
      contact: contactData,
      address: {
        ...address,
        currlocation: address.currlocation || "",
        country: address.country || "",
        state: address.state || "",
        district: address.district || "",
        city: address.city || "",
        postoffice: address.postoffice || "",
        pin: address.pin || "",
        landmark: address.landmark || "",
        street: address.street || "",
        apartment: address.apartment || "",
        floor: address.floor || "",
        room: address.room || "",
      },
      profession: {
        category: "",
        job: "",
        specialization: "",
      },
    };

    const newUser = new userModel(userData);
    const savedUser = await newUser.save();

    // Send credentials via available contact methods
    const notifications = [];

    if (hasEmail) {
      const emailSent = await sendEmail(
        email,
        finalUsername,
        generatedPassword,
        fullname
      );
      notifications.push(
        emailSent ? "Email sent successfully" : "Email sending failed"
      );
    }

    if (hasMobile) {
      const smsSent = await sendSMS(mobile, finalUsername, generatedPassword);
      notifications.push(
        smsSent ? "SMS sent successfully" : "SMS sending failed"
      );
    }

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
      userId: savedUser._id,
      username: finalUsername,
      notifications,
      message:
        "User registered successfully. Login credentials sent to provided contact methods.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    console.log(username);
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const utoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, utoken, userId: user._id });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getUserProfile = async (req, res) => {
  console.log("Into the function");
  try {
    console.log("Tryinggggg...");
    const { userId } = req.body;
    console.log(req.body);
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      userId,
      fullname,
      gender,
      dob,
      username,
      email,
      mobileno,
      contact,
      address,
      profession,
    } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    // Check if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.json({ success: false, message: "User not found" });
    }

    const updateData = {};

    // Update basic fields if provided
    if (fullname) updateData.fullname = fullname;
    if (gender) updateData.gender = gender;
    if (dob) updateData.dob = dob;

    // Handle username update with uniqueness check
    if (username && username !== existingUser.username) {
      const usernameExists = await userModel.findOne({
        username,
        _id: { $ne: userId },
      });
      if (usernameExists) {
        return res.json({ success: false, message: "Username already taken" });
      }
      updateData.username = username;
    }

    // Handle contact updates
    let updatedContact = { ...existingUser.contact };

    // Update email if provided and different
    if (email && email !== existingUser.contact?.email) {
      // Check if email is already taken by another user
      const emailExists = await userModel.findOne({
        "contact.email": email,
        _id: { $ne: userId },
      });
      if (emailExists) {
        return res.json({ success: false, message: "Email already taken" });
      }
      updatedContact.email = email;
    }

    // Update mobile number if provided
    if (mobileno) {
      const mobileData =
        typeof mobileno === "string" ? JSON.parse(mobileno) : mobileno;

      // Check if mobile number is already taken by another user
      if (
        mobileData.number &&
        mobileData.number !== existingUser.contact?.mobileno?.number
      ) {
        const mobileExists = await userModel.findOne({
          "contact.mobileno.number": mobileData.number,
          _id: { $ne: userId },
        });
        if (mobileExists) {
          return res.json({
            success: false,
            message: "Mobile number already taken",
          });
        }
        updatedContact.mobileno = {
          code:
            mobileData.code || existingUser.contact?.mobileno?.code || "+91",
          number: mobileData.number,
        };
      }
    }

    // Handle other contact fields if provided
    if (contact) {
      const contactData =
        typeof contact === "string" ? JSON.parse(contact) : contact;
      updatedContact = { ...updatedContact, ...contactData };
    }

    updateData.contact = updatedContact;

    // Handle address update
    if (address) {
      const addressData =
        typeof address === "string" ? JSON.parse(address) : address;
      updateData.address = {
        ...existingUser.address,
        ...addressData,
      };
    }

    // Handle profession update
    if (profession) {
      const professionData =
        typeof profession === "string" ? JSON.parse(profession) : profession;
      updateData.profession = {
        ...existingUser.profession,
        ...professionData,
      };
    }

    // Update user profile
    await userModel.findByIdAndUpdate(userId, updateData, { new: true });

    res.json({ success: true, message: "User Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Change Password Route
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, userId } = req.body;
    console.log(req);

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Check password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

const generateBillHTML = (donationData, userData) => {
  const { list, amount, method, courierCharge, transactionId, createdAt, _id } =
    donationData;
  console.log("list: ", list);

  const totalAmount = amount + courierCharge;
  const paymentStatus = method === "Online" ? "PAID" : "TO BE PAID IN OFFICE";
  const paymentStatusColor = method === "Online" ? "#28a745" : "#ffc107";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .bill-container { max-width: 800px; margin: 0 auto; border: 2px solid #ddd; padding: 30px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .org-name { font-size: 28px; font-weight: bold; color: #d32f2f; margin-bottom: 5px; }
        .org-full-name { font-size: 16px; color: #666; margin-bottom: 10px; }
        .org-address { font-size: 14px; color: #666; }
        .receipt-title { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; color: #333; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .receipt-number { font-weight: bold; }
        .date { font-weight: bold; }
        .donor-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .donor-info h3 { margin-top: 0; color: #333; }
        .table-container { margin: 20px 0; }
        .donation-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .donation-table th, .donation-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .donation-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .payment-info { display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-top: 20px; }
        .payment-method { font-weight: bold; }
        .payment-status { padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        .transaction-id { font-size: 12px; color: #666; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header">
          <div class="org-name">SDPJSS</div>
          <div class="org-full-name">Shree Durga Patwaye Jati Sudhar Samiti</div>
          <div class="org-address">Durga Asthan, Manpur, Gaya, Bihar, India - 823003</div>
        </div>

        <div class="receipt-title">DONATION RECEIPT</div>

        <div class="receipt-info">
          <div class="receipt-number">Receipt No: ${_id
            .toString()
            .slice(-8)
            .toUpperCase()}</div>
          <div class="date">Date: ${new Date(createdAt).toLocaleDateString(
            "en-IN"
          )}</div>
        </div>

        <div class="donor-info">
          <h3>Donor Information</h3>
          <p><strong>Name:</strong> ${userData.fullname}</p>
          <p><strong>Contact:</strong> ${userData.contact.email || ""} ${
    userData.contact.email && userData.contact.mobileno.number !== "0000000000"
      ? "|"
      : ""
  } ${
    userData.contact.mobileno.number !== "0000000000"
      ? `${userData.contact.mobileno.code} ${userData.contact.mobileno.number}`
      : ""
  }</p>
          <p><strong>Address:</strong> ${
            userData.address.street ? userData.address.street + ", " : ""
          }${userData.address.city ? userData.address.city + ", " : ""}${
    userData.address.district ? userData.address.district + ", " : ""
  }${userData.address.state ? userData.address.state + ", " : ""}${
    userData.address.country ? userData.address.country : ""
  } ${userData.address.pin ? "- " + userData.address.pin : ""}</p>
        </div>

        <div class="table-container">
          <table class="donation-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
                <th>Weight (Kg)</th>
                <th>Packet</th>
              </tr>
            </thead>
            <tbody>
              ${list
                .map(
                  (item) => `
                <tr>
                  <td>${item.category}</td>
                  <td>${item.number}</td>
                  <td>₹${item.amount}</td>
                  <td>${item.quantity}</td>
                  <td>${item.isPacket ? 1 : 0}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td><strong>Courier Charges</strong></td>
                <td>-</td>
                <td><strong>₹${courierCharge}</strong></td>
                <td>-</td>
                <td>-</td>
              </tr>
              <tr class="total-row">
                <td><strong>TOTAL AMOUNT</strong></td>
                <td>-</td>
                <td><strong>₹${totalAmount}</strong></td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="payment-info">
          <div class="payment-method">Payment Method: ${method}</div>
          <div class="payment-status" style="background-color: ${paymentStatusColor};">${paymentStatus}</div>
        </div>

        <div class="transaction-id">Transaction ID: ${transactionId}</div>

        <div class="footer">
          <p>Thank you for your generous donation!</p>
          <p>This is a computer-generated receipt.</p>
          <p>For any queries, please contact us at Durga Asthan, Manpur, Gaya, Bihar, India - 823003</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendDonationReceiptEmail = async (email, donationData, userData) => {
  try {
    // Generate HTML bill
    const billHTML = generateBillHTML(donationData, userData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(billHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const receiptNumber = donationData._id.toString().slice(-8).toUpperCase();
    const paymentStatus =
      donationData.method === "Online" ? "PAID" : "TO BE PAID IN OFFICE";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Donation Receipt - SDPJSS - ${receiptNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Thank you for your donation!</h2>
          <p>Dear ${userData.fullname},</p>
          <p>We have received your donation. Please find your receipt below and attached as PDF.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Quick Summary:</h3>
            <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
            <p><strong>Total Amount:</strong> ₹${
              donationData.amount + donationData.courierCharge
            }</p>
            <p><strong>Payment Method:</strong> ${donationData.method}</p>
            <p><strong>Status:</strong> <span style="color: ${
              donationData.method === "Online" ? "#28a745" : "#ffc107"
            }; font-weight: bold;">${paymentStatus}</span></p>
          </div>
          
          ${billHTML}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            <p>Best regards,<br>
            <strong>SDPJSS Team</strong><br>
            Shree Durga Patwaye Jati Sudhar Samiti<br>
            Durga Asthan, Manpur, Gaya, Bihar, India - 823003</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `SDPJSS_Receipt_${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Donation receipt email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Receipt email sending failed:", error);
    return false;
  }
};

// API to create a donation order (initiate payment)
const createDonationOrder = async (req, res) => {
  try {
    const {
      userId,
      list,
      amount,
      method,
      courierCharge,
      remarks,
      postalAddress,
    } = req.body;
    console.log("Create Donation Request: ", req.body);

    if (
      !userId ||
      !list ||
      !amount ||
      !method ||
      courierCharge === undefined ||
      !postalAddress
    ) {
      return res.json({
        success: false,
        message: "Missing required donation fields",
      });
    }
    if (amount <= 0) {
      return res.json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }
    if (!["Cash", "Online"].includes(method)) {
      return res.json({ success: false, message: "Invalid payment method" });
    }

    // In createDonationOrder function, for cash donations, after creating donation:

    if (method === "Cash") {
      const donation = await donationModel.create({
        userId,
        list,
        amount,
        method,
        courierCharge,
        remarks,
        transactionId: `CASH_${Date.now()}`,
        paymentStatus: "completed",
        postalAddress,
      });

      // Get user data and send email
      const userData = await userModel.findById(userId);
      if (userData && userData.contact.email) {
        await sendDonationReceiptEmail(
          userData.contact.email,
          donation,
          userData
        );
      }

      return res.json({
        success: true,
        message: "Cash donation recorded and receipt sent",
        donation,
        paymentRequired: false,
      });
    }

    // For online payments:
    // 1. Create a Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise, rounded to avoid float issues
      currency: process.env.CURRENCY || "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId, postalAddress },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 2. Create the donation record in your DB with 'pending' status
    const tempDonation = await donationModel.create({
      userId,
      list,
      amount,
      method,
      courierCharge,
      remarks,
      razorpayOrderId: razorpayOrder.id, // Store Razorpay order ID
      paymentStatus: "pending",
      postalAddress,
    });

    res.json({
      success: true,
      message: "Donation order created successfully",
      order: razorpayOrder,
      donationId: tempDonation._id, // Send your internal donationId to frontend
      paymentRequired: true,
    });
  } catch (error) {
    console.log("Error in createDonationOrder:", error);
    res.json({
      success: false,
      message: "Failed to create order. See server logs.",
    });
  }
};

// API to verify Razorpay payment and update donation
const verifyDonationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationId, // Your internal donation ID
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !donationId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment verification data" });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // If signature is invalid, mark payment as failed
      await donationModel.findByIdAndUpdate(donationId, {
        paymentStatus: "failed",
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }

    // If signature is valid, update the donation record
    const updatedDonation = await donationModel
      .findByIdAndUpdate(
        donationId,
        {
          transactionId: razorpay_payment_id,
          paymentStatus: "completed",
          $unset: { razorpayOrderId: 1 }, // Remove temporary order ID
        },
        { new: true }
      )
      .populate("userId", "fullname contact");

    if (!updatedDonation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation record not found" });
    }

    // TODO: Send a confirmation email/SMS to the user here

    res.json({
      success: true,
      message: "Payment verified successfully!",
      donation: updatedDonation,
    });

    // Get user data for email
    const userData = await userModel.findById(updatedDonation.userId);

    // Send confirmation email with receipt
    if (userData && userData.contact.email) {
      const emailSent = await sendDonationReceiptEmail(
        userData.contact.email,
        updatedDonation,
        userData
      );

      if (emailSent) {
        console.log("Donation receipt email sent successfully");
      } else {
        console.log("Failed to send donation receipt email");
      }
    }
  } catch (error) {
    console.log("Error in verifyDonationPayment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during payment verification.",
    });
  }
};
// API to get donations by user
const getUserDonations = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required",
      });
    }

    const donations = await donationModel
      .find({ userId })
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      success: true,
      donations,
    });
  } catch (error) {
    console.log("Error in getUserDonations:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  createDonationOrder,
  verifyDonationPayment,
  getUserDonations,
};
