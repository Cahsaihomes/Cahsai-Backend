// middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";

// Multer memory storage config for Cloudinary uploads
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/mov"];
  const allowedDocTypes = ["application/pdf"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype) ||
    allowedDocTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images, videos, and PDFs are allowed."),
      false
    );
  }
};

export const postUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
