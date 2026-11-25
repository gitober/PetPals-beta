const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  if (req.body && Object.keys(req.body).length) {
    console.log("Body:  ", req.body);
  } else {
    console.log("Body:  (empty)");
  }
  console.log("---");
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
  console.error("Error message:", error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Upload problems (file too big, wrong field) from multer
  if (error.name === "MulterError") {
    const message =
      error.code === "LIMIT_FILE_SIZE" ? "The image is too big, the limit is 5 MB" : error.message;
    return res.status(400).json({ error: message });
  }

  // Wrong file type from the upload filter
  if (error.message === "Only .jpeg, .jpg, and .png files are allowed!") {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
