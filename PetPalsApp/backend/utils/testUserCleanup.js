// Beta: removes a temporary test user and everything they left behind.
// Only touches accounts marked isTestUser, so seed and real accounts are safe.

const fs = require("fs/promises");
const path = require("path");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

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

module.exports = { deleteTestUser };
