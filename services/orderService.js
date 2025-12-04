const asyncHandler = require("express-async-handler");

const Order = require("../models/orderModel");
const factory = require("./handlersFactory");
const APiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @ desc    Create cash order
// @ route   POST /api/v1/orders/cash
// @ access  Private // User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxtPrice = req.body.taxPrice || 0;
  const shippingPrice = req.body.shippingPrice || 0;
  // 1) Get cart => cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new APiError("There is no cart for this user", 404));
  }

  const cartPrice = cart.totalPriceAfterDiscount || cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxtPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cartItem: cart.cartItem,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 3) After creating order, decrement product quantity, increment sold product

  if (order) {
    const bulkOptions = cart.cartItem.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});

    // 4) Clear cart
    await Cart.findByIdAndDelete(cart._id);
  }

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: order,
  });
});

// @ desc    Get logged user orders
// @ route   GET /api/v1/orders/my-orders
// @ access  Private // User
exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filter = { user: req.user._id };
  }
  next();
});

// @ desc    Get all orders
// @ route   GET /api/v1/orders
// @ access  Private // Admin -Manger -SuperAdmin
exports.getAllOrders = factory.getAll(Order);

// @ desc    Get specific order
// @ route   GET /api/v1/orders/:id
// @ access  Private // Admin -Manger -SuperAdmin
exports.getSpecificOrder = factory.getOne(Order);

// updateOrder

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new APiError("There is no order for this id", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    message: "Order paid successfully",
    data: updatedOrder,
  });
});

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new APiError("There is no order for this id", 404));
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();
  res.status(200).json({
    status: "success",
    message: "Order delivered successfully",
    data: updatedOrder,
  });
});
