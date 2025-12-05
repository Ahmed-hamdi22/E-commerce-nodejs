const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/orderModel");
const factory = require("./handlersFactory");
const APiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

dotenv.config({ path: "config.env" });

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

// @desc    Create checkout session from stripe
// @route   POST /api/v1/orders/checkout-session/:cartId
// @access  Private/User
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart based on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new APiError(`There is no such cart with id ${req.params.cartId}`, 404));
  }

  // 2) Get order price depend on if there is coupon or not
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItem,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItem.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};
