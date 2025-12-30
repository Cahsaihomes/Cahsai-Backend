import express from "express";
import {
  addBankDetails,
  addPaymentMethod,
  createAgentProfile,
  createPaymentDetails,
  deletePaymentMethod,
  followUser,
  getNotificationPreferences,
  getPaymentMethod,
  getUserProfile,
  login,
  logout,
  register,
  requestOTP,
  resetPassword,
  toggleNotificationPreferences,
  updatePassword,
  updateProfile,
  verifyForgetPasswordOTP,
  verifyOtp,
  unfollowUser,
  getUserOverview,
} from "../controllers/user.controller.mjs";
// import uploadFile from "../middlewares/upload.middleware.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/register", register);
router.post("/payment-details", createPaymentDetails);
router.put(
  "/create-agent",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  createAgentProfile
);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password/request-otp", requestOTP);
router.post("/forget-password/verify-otp", verifyForgetPasswordOTP);
router.post("/forget-password/reset-password", resetPassword);
router.get("/profile", isAuthenticated, getUserProfile);
router.put(
  "/updateProfile",
  isAuthenticated,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "identity" },
    { name: "cnic", maxCount: 1 },
    { name: "passport", maxCount: 1 },
  ]),
  updateProfile
);
router.put("/updatePassword", isAuthenticated, updatePassword);

router.post("/payment-method", isAuthenticated, addPaymentMethod);
router.post(
  "/account-detail",
  isAuthenticated,
  upload.fields([{ name: "bank_verification" }]),
  addBankDetails
);
router.delete("/payment-method", isAuthenticated, deletePaymentMethod);
router.get("/payment-method", isAuthenticated, getPaymentMethod);

router.put(
  "/notification-preferences",
  isAuthenticated,
  toggleNotificationPreferences
);
router.get(
  "/notification-preferences",
  isAuthenticated,
  getNotificationPreferences
);

// Follow/unfollow routes
router.post("/:id/follow", isAuthenticated, followUser);
router.delete("/:id/follow", isAuthenticated, unfollowUser);
// User overview route
router.get("/:id/overview", isAuthenticated, getUserOverview);

router.post("/logout", logout);

export default router;
