import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import AppError from "../utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory
const uploadDir = path.join(__dirname, "../../public/uploads/hospitals");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `hospital-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp|jfif|pjpeg/;
  
  // Always check the MIME type first
  const isValidMime = allowedTypes.test(file.mimetype);
  
  // Get the extension. If missing, we trust the MIME type.
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = ext ? allowedTypes.test(ext) : true;

  if (isValidMime && isValidExt) {
    return cb(null, true);
  } else {
    cb(new AppError(`Invalid image! Received Name: ${file.originalname}, Type: ${file.mimetype}`, 400), false);
  }
};

// Initialize multer
export const uploadHospitalLogo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
