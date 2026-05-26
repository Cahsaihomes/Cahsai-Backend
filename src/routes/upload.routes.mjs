import express from "express";
import cloudinary from "../config/cloudnary.mjs";
import { isAuthenticated } from "../middlewares/authMiddleware.mjs";
import config from "../config/config.mjs";

const router = express.Router();

const allowedFolders = new Set(["post_images", "post_videos"]);
const allowedResourceTypes = new Set(["image", "video"]);

router.post("/cloudinary-signature", isAuthenticated, (req, res) => {
  try {
    if (!allowedFolders.has(req.body.folder)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid upload folder.",
      });
    }

    if (!allowedResourceTypes.has(req.body.resourceType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid upload type.",
      });
    }

    const folder = req.body.folder;
    const resourceType = req.body.resourceType;
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      config.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      status: "success",
      data: {
        cloudName: config.CLOUDINARY_CLOUD_NAME,
        apiKey: config.CLOUDINARY_API_KEY,
        folder,
        resourceType,
        timestamp,
        signature,
      },
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to prepare upload",
    });
  }
});

export default router;
