const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const ApiError = require("./utils/apiError");

dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const globalError = require("./middlewares/errorMiddleware");

// Routes

const categoryRoute = require("./routes/categoryRoute");
const subcategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");

// Connect with db
dbConnection();

// express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
// Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subcategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);

// All Unhandled Routes
app.use((req, res, next) => next(new ApiError(`Route ${req.originalUrl} not found`, 404)));

// Handle Unhandled Routes
app.use(globalError);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
  });
});

// Server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

// Handel Unhandled Rejections outside of express
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down...");
    process.exit(1);
  });
});
