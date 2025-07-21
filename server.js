require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Global security and utility middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Documentation
const swaggerSpec = require("./config/swagger");
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Coding Platform API Documentation",
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Import routes
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuth");
const problemsRoutes = require("./routes/problems");
const submissionsRoutes = require("./routes/submissions");
const profileRoutes = require("./routes/profile");
const chatRoutes = require("./routes/chat");


app.use("/api", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Coding Platform API",
    documentation: "/api-docs",
    health: "/health",
  });
});

// Route registration loggers (for development)
if (process.env.NODE_ENV !== "production") {
  const origGet = app.get;
  const origPost = app.post;
  app.get = function (path, ...args) {
    console.log("Registering GET route:", path);
    return origGet.call(this, path, ...args);
  };
  app.post = function (path, ...args) {
    console.log("Registering POST route:", path);
    return origPost.call(this, path, ...args);
  };
}


app.use("/api/auth", authRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;