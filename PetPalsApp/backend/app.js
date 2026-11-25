require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const { serveImage } = require("./utils/imageStore");
const customMiddleware = require("./middleware/customMiddleware");
const postRouter = require("./routers/postRouter");
const userRouter = require("./routers/userRouter");
const commentRouter = require("./routers/commentRouter");

const app = express();

// Beta: Render sits in front of the app as a proxy. Trusting one proxy hop
// lets the server see each tester's own IP, so rate limits are per tester
// instead of shared by everyone.
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Security middleware (helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Allows cross-origin resource sharing
    contentSecurityPolicy: {
      directives: {
        // Allow image previews (blob:) when choosing a photo for a new post
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
  })
);

// Rate Limiting middleware (only API calls count, not pages or images)
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Per tester. The beta checklist alone checks in about 110 times per 15 minutes
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api", limiter);
}

// Logging middleware (morgan)
app.use(morgan("dev"));

// CORS middleware
const allowedOrigins = [
  process.env.FRONTEND_URL, // Frontend URL from environment
  process.env.RENDER_EXTERNAL_URL, // Beta: Render sets this to the app's own address
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("CORS policy violation: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads
app.use(cookieParser()); // Reads cookies, needed for the refresh token

// Serve static files from the "uploads" directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);
// Images uploaded by users are stored in the database, not on disk
app.get("/uploads/:filename", serveImage);

// Log request details for debugging (only in development mode)
if (process.env.NODE_ENV === "development") {
  app.use(customMiddleware.requestLogger);
}

// API Routes
// Root route, only when the frontend is not served from here
if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => res.send("Root of the server!"));
}
app.use("/api/users", userRouter); // User-related routes
app.use("/api/posts", postRouter); // Post-related routes
app.use("/api/comments", commentRouter); // Comment-related routes

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  // The React build lives next to the backend folder: PetPalsApp/frontend/build
  const frontendPath = path.join(__dirname, "..", "frontend", "build");
  app.use(express.static(frontendPath)); // Serve static frontend files

  // Any other page (not /api or /uploads) gets React's index.html, so links like /home work
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Middleware for unknown endpoints
app.use(customMiddleware.unknownEndpoint);

// Error handling middleware
app.use(customMiddleware.errorHandler);

module.exports = app;
