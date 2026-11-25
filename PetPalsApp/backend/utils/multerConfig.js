const multer = require("multer");
const path = require("path");
const { saveImage } = require("./imageStore");

// File uploads: multer keeps the file in memory, then it is saved to MongoDB
// (see imageStore.js), so images survive Render deploys and restarts.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per image

// File filter configuration
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/; // Allowed extensions
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  }
  cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Unique, URL-safe name: timestamp plus the original name with only safe characters
const makeFileName = (originalName) => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._]/g, "_");
  return `${Date.now()}-${safeName}`;
};

// After multer: save the file to the database and set req.file.filename,
// so the routes can keep using `/uploads/${req.file.filename}`
const storeInDatabase = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = makeFileName(req.file.originalname);
    await saveImage(req.file.buffer, filename, req.file.mimetype);
    req.file.filename = filename;
    req.file.buffer = undefined; // Free the memory
    next();
  } catch (error) {
    console.error("Could not save uploaded image:", error.message);
    res.status(500).json({ error: "Could not save the image, please try again" });
  }
};

// Same use as before in the routes: upload.single("image")
module.exports = {
  single: (fieldName) => [memoryUpload.single(fieldName), storeInDatabase],
};
