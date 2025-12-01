const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  resizeProductImages,
} = require("../services/productSevices");

const AuthService = require("../services/authService");
const reviewsRoute = require("./reviewRoute");

const router = express.Router();

// Nested route for reviews related to a specific product
// post /api/v1/products/:productId/reviews
// get /api/v1/products/:productId/reviews
// get /api/v1/products/:productId/reviews/:reviewId
router.use("/:productId/reviews", reviewsRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    uploadProductImage,
    resizeProductImages,
    createProductValidator,
    createProduct,
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    uploadProductImage,
    resizeProductImages,
    updateProductValidator,
    updateProduct,
  )
  .delete(
    AuthService.protect,
    AuthService.allowedTo("admin", "superadmin"),
    deleteProductValidator,
    deleteProduct,
  );

module.exports = router;
