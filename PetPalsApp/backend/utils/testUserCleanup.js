// Beta: removes a temporary test user and everything they left behind.
// Only touches accounts marked isTestUser, so seed and real accounts are safe.

const fs = require("fs/promises");
const path = require("path");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

// A test account is removed after this long without activity (1 hour)
const TEST_USER_LIFETIME_MS = 60 * 60 * 1000;
// How often the server looks for expired test accounts (10 minutes)
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

// Delete an uploaded image file, ignoring placeholders and anything outside uploads/
const removeUploadedFile = async (imagePath) => {
  if (!imagePath || /^https?:\/\//.test(imagePath)) return;

  const fileName = path.basename(imagePath);
  if (!fileName || fileName === "placeholder-image.png") return;

  try {
    await fs.unlink(path.join(UPLOADS_DIR, fileName));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Could not delete file ${fileName}:`, error.message);
    }
  }
};

const deleteTestUser = async (userId) => {
  const user = await User.findById(userId).select("_id username isTestUser profilePicture");
  if (!user || !user.isTestUser) {
    return false; // Not a test account, leave it alone
  }

  // Their posts, and every comment on those posts (from anyone)
  const posts = await Post.find({ user_id: user._id }).select("_id image");
  const postIds = posts.map((post) => post._id);
  await Comment.deleteMany({ postId: { $in: postIds } });
  await Post.deleteMany({ _id: { $in: postIds } });

  // Their comments on other people's posts
  await Comment.deleteMany({ user_id: user._id });

  // Their likes on other people's posts
  await Post.updateMany({ likes: user._id }, { $pull: { likes: user._id } });

  // Their follows, in both directions
  await User.updateMany(
    { $or: [{ followers: user._id }, { following: user._id }] },
    { $pull: { followers: user._id, following: user._id } }
  );

  // Uploaded images
  await Promise.all(posts.map((post) => removeUploadedFile(post.image)));
  await removeUploadedFile(user.profilePicture);

  // Finally the account itself
  await User.deleteOne({ _id: user._id });

  console.log(`Beta cleanup: removed test user ${user.username}`);
  return true;
};

// Remove every test account whose time has run out
const removeExpiredTestUsers = async () => {
  try {
    const expired = await User.find({ isTestUser: true, expiresAt: { $lt: new Date() } }).select("_id");
    for (const user of expired) {
      await deleteTestUser(user._id);
    }
    if (expired.length) {
      console.log(`Beta cleanup: removed ${expired.length} expired test account(s)`);
    }
  } catch (error) {
    console.error("Beta cleanup failed:", error.message);
  }
};

// Run once now (also covers the server waking up from sleep) and then on a timer
const startTestUserSweep = () => {
  removeExpiredTestUsers();
  const timer = setInterval(removeExpiredTestUsers, SWEEP_INTERVAL_MS);
  timer.unref(); // Don't keep the process alive just for this
};

// Push a test account's expiry forward while it is being used.
// Only writes to the database when the timer has run down by a few minutes.
const extendTestUser = async (user) => {
  if (!user || !user.isTestUser) return;

  const newExpiry = Date.now() + TEST_USER_LIFETIME_MS;
  const current = user.expiresAt ? user.expiresAt.getTime() : 0;
  if (newExpiry - current < 5 * 60 * 1000) return;

  try {
    await User.updateOne({ _id: user._id }, { expiresAt: new Date(newExpiry) });
  } catch (error) {
    console.error("Could not extend test account:", error.message);
  }
};

module.exports = {
  TEST_USER_LIFETIME_MS,
  deleteTestUser,
  removeExpiredTestUsers,
  startTestUserSweep,
  extendTestUser,
};
