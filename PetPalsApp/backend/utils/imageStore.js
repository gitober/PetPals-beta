// Uploaded images are kept in MongoDB (GridFS) instead of the server's disk.
// Render's free plan wipes the disk on every deploy, restart and sleep, so
// files saved there disappear. The database keeps them until the post or
// test account is deleted. Seed images that come with the code still live
// in the uploads/ folder and are served from there first.

const path = require("path");
const mongoose = require("mongoose");

const BUCKET_NAME = "uploads";

const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database is not connected");
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
};

// Save an uploaded image and resolve with its file name
const saveImage = (buffer, filename, contentType) =>
  new Promise((resolve, reject) => {
    const upload = getBucket().openUploadStream(filename, { contentType });
    upload.on("error", reject);
    upload.on("finish", () => resolve(filename));
    upload.end(buffer);
  });

// Delete a stored image by its path ("/uploads/name.jpg" or "uploads/name.jpg").
// Only touches the database, never the seed files on disk.
const deleteImage = async (imagePath) => {
  if (!imagePath || /^https?:\/\//.test(imagePath)) return;

  const filename = path.basename(imagePath);
  if (!filename || filename === "placeholder-image.png") return;

  const bucket = getBucket();
  const files = await bucket.find({ filename }).toArray();
  await Promise.all(files.map((file) => bucket.delete(file._id)));
};

// Express handler for GET /uploads/:filename (runs after the disk check)
const serveImage = async (req, res, next) => {
  try {
    const bucket = getBucket();
    const [file] = await bucket.find({ filename: req.params.filename }).limit(1).toArray();
    if (!file) return next();

    res.set({
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Length": file.length,
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    });

    const download = bucket.openDownloadStream(file._id);
    download.on("error", (error) => {
      console.error("Could not send image:", error.message);
      if (!res.headersSent) next(error);
      else res.end();
    });
    download.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = { saveImage, deleteImage, serveImage };
