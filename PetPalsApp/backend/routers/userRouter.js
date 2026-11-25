const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireSelf = require("../middleware/requireSelf");
const upload = require("../utils/multerConfig");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const rateLimit = require("express-rate-limit");

const {
  loginUser,
  signupUser,
  validateField,
  getAllUsers,
  getUserByUsername,
  updateUserByUsername,
  updatePasswordByUsername,
  updateProfilePicture,
  followUser,
  unfollowUser,
  logoutUser,
  demoLogin,
  forgotPassword,
  resetPassword,
  validatePassword,
} = require("../controllers/userController");
const { refreshAccessToken } = require("../utils/authHelpers");

const router = express.Router();

// ==============================
// Rate-Limiting Middleware
// ==============================
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many password reset requests. Please try again later." },
});

// ==============================
// Authentication Routes
// ==============================
router.post("/login", loginUser); // Log in a user
router.post("/signup", signupUser); // Sign up a new user

// Beta: one demo account per IP every few minutes, so nobody floods the free database
const demoLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { error: "Too many demo accounts created. Please try again in a few minutes." },
});
router.post("/demo", demoLimiter, demoLogin); // Create a temporary test account and log in
router.post("/refresh-token", refreshAccessToken); // Refresh authentication token
router.post("/logout", requireAuth, logoutUser); // Log out a user (beta: also removes test accounts)

// ==============================
// Password Reset Routes
// ==============================
// Beta: password reset is switched off. Test accounts have made-up emails,
// so no reset emails are sent. Remove these two lines to switch it back on.
const notInBeta = (req, res) =>
  res.status(403).json({ error: "Password reset is not available in the demo." });
router.post("/forgot-password", forgotPasswordLimiter, notInBeta);
router.post("/reset-password", notInBeta);
// router.post("/forgot-password", forgotPasswordLimiter, forgotPassword); // Request a password reset
// router.post("/reset-password", resetPassword); // Reset password using a token

// ==============================
// Validation Routes
// ==============================
router.post("/validate", validateField); // Validate username or email availability
router.post("/validate-password", requireAuth, validatePassword); // Validate current password
router.post("/check", async (req, res) => {
  // Inline validation for username or email
  const { username, email } = req.body;

  try {
    if (username) {
      const usernameExists = await User.findOne({
        username: { $regex: `^${username}$`, $options: "i" }, // Case-insensitive match
      });
      if (usernameExists) {
        return res.status(400).json({ error: "Username is already in use" });
      }
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    res.status(200).json({ message: "Valid input" });
  } catch (error) {
    console.error("Error during validation check:", error.message);
    res.status(500).json({ error: "An error occurred during validation. Please try again." });
  }
});

// ==============================
// User Management Routes
// ==============================
router.get("/", getAllUsers); // Get all users
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "username email createdAt profilePicture"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /users/me:", error.message);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Beta: which test-checklist tasks this user has done, worked out from their data
router.get("/me/progress", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const [user, hasPost, hasLike, hasComment] = await Promise.all([
      User.findById(userId).select("bioText profilePicture following"),
      Post.exists({ user_id: userId }),
      Post.exists({ likes: userId }),
      Comment.exists({ user_id: userId }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      loggedIn: true,
      posted: Boolean(hasPost),
      liked: Boolean(hasLike),
      commented: Boolean(hasComment),
      followed: user.following.length > 0,
      editedProfile:
        Boolean(user.bioText) ||
        (Boolean(user.profilePicture) && user.profilePicture !== "placeholder-image.png"),
    });
  } catch (error) {
    console.error("Error in /users/me/progress:", error.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// ==============================
// Individual User Routes
// ==============================
router.get("/:username", getUserByUsername); // Get a user's details by username
router.patch("/:username", requireAuth, requireSelf, updateUserByUsername); // Update your own details
router.patch("/:username/password", requireAuth, requireSelf, updatePasswordByUsername); // Update your own password
router.patch(
  "/:username/profile-picture",
  requireAuth,
  requireSelf, // Checked before the upload, so nothing is saved for someone else's account
  upload.single("profilePicture"), // Multer middleware for profile picture uploads
  updateProfilePicture // Update a user's profile picture
);

// ==============================
// Follow/Unfollow Routes
// ==============================
router.post("/:username/follow", requireAuth, followUser); // Follow a user
router.delete("/:username/follow", requireAuth, unfollowUser); // Unfollow a user

module.exports = router;
