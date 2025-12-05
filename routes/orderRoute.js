const express = require("express");

const {
  createCashOrder,
  getSpecificOrder,
  getAllOrders,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  createCheckoutSession,
} = require("../services/orderService");

const AuthService = require("../services/authService");

const router = express.Router();

router.post(
  "/checkout-session/:cartId",
  AuthService.protect,
  AuthService.allowedTo("user"),
  createCheckoutSession,
);

router.post("/:cartId", AuthService.protect, AuthService.allowedTo("user"), createCashOrder);
router.get(
  "/",
  AuthService.protect,
  AuthService.allowedTo("admin", "manager", "superadmin"),
  filterOrderForLoggedUser,
  getAllOrders,
);
router.get(
  "/:id",
  AuthService.protect,
  AuthService.allowedTo("admin", "manager", "superadmin", "user"),
  getSpecificOrder,
);
router.put(
  "/:id/pay",
  AuthService.protect,
  AuthService.allowedTo("admin", "manager", "superadmin"),
  updateOrderToPaid,
);
router.put(
  "/:id/deliver",
  AuthService.protect,
  AuthService.allowedTo("admin", "manager", "superadmin"),
  updateOrderToDelivered,
);

module.exports = router;
