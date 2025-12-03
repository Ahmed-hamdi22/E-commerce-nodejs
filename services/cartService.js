const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

// Calculate total cart price
const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItem.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  return totalPrice;
};

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new ApiError(`There is no cart for this user id : ${req.user._id}`, 404));
  }
  res.status(200).json({ status: "success", numOfCartItems: cart.cartItem.length, data: cart });
});

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // Get cart for logged user
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      userId: req.user._id,
      cartItem: [
        {
          productId,
          quantity: 1,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // product exist in cart, update product quantity
    const itemIndex = cart.cartItem.findIndex(
      (item) => item.productId.toString() === productId && item.color === color,
    );
    if (itemIndex > -1) {
      const cartitem = cart.cartItem[itemIndex];
      cartitem.quantity += 1;
      cart.cartItem[itemIndex] = cartitem;
    } else {
      // product not exist in cart,  push product to cartItem array
      cart.cartItem.push({
        productId,
        quantity: 1,
        color,
        price: product.price,
      });
    }
  }
  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItem.length,
    data: cart,
  });
});

// @desc    Remove product from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private

exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    {
      $pull: { cartItem: { _id: req.params.itemId } },
    },
    { new: true },
  );

  if (!cart) {
    return next(new ApiError(`There is no cart for this user: ${req.user._id}`, 404));
  }

  // Recalculate total cart price and save it
  calcTotalCartPrice(cart);
  // if a coupon was applied, recalculate the price after discount
  if (cart.totalPriceAfterDiscount) {
    const coupon = await Coupon.findOne({ name: cart.couponName }); // Assuming you store coupon name on cart
    if (coupon) {
      const totalPriceAfterDiscount = (
        cart.totalCartPrice -
        (cart.totalCartPrice * coupon.discount) / 100
      ).toFixed(2);
      cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
    }
  }
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
  });
});

// @desc    Clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private

exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ userId: req.user._id });
  if (!cart) {
    return next(new ApiError(`There is no cart for this user: ${req.user._id}`, 404));
  }
  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
  });
});

// @desc    Update product quantity in cart
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateProductQuantityInCart = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new ApiError(`There is no cart for this user: ${req.user._id}`, 404));
  }

  const itemIndex = cart.cartItem.findIndex((item) => item._id.toString() === req.params.itemId);
  if (itemIndex === -1) {
    return next(new ApiError(`There is no item with id: ${req.params.itemId} in the cart`, 404));
  }
  if (quantity <= 0) {
    return next(new ApiError("Quantity must be greater than zero", 400));
  }

  const cartItem = cart.cartItem[itemIndex];
  cartItem.quantity = quantity;
  cart.cartItem[itemIndex] = cartItem;
  // Recalculate total cart price and save it
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product quantity updated successfully",
    data: cart,
  });
});

// @desc    Apply coupon to cart
// @route   PUT /api/v1/cart/apply-coupon
// @access  Private

exports.applyCouponToCart = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("Invalid coupon code", 400));
  }
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return next(new ApiError(`There is no cart for this user: ${req.user._id}`, 404));
  }
  const totalPrice = calcTotalCartPrice(cart);
  const totalPriceAfterDiscount = (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    data: cart,
  });
});
