const express = require("express");

const {
  getCart,
  addProductToCart,
  removeProductFromCart,
  clearCart,
  updateProductQuantityInCart,
  applyCouponToCart,
} = require("../services/cartService");

const AuthService = require("../services/authService");

const router = express.Router();
router
  .route("/applyCoupon")
  .put(AuthService.protect, AuthService.allowedTo("user"), applyCouponToCart);

router
  .route("/")
  .get(AuthService.protect, getCart)
  .post(AuthService.protect, AuthService.allowedTo("user"), addProductToCart);

router
  .route("/:itemId")
  .delete(AuthService.protect, removeProductFromCart)
  .put(AuthService.protect, AuthService.allowedTo("user"), updateProductQuantityInCart);
router.route("/").delete(AuthService.protect, clearCart);

module.exports = router;
