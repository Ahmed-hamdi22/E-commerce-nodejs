const factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

// @desc    Get list of Coupon
// @route   GET /api/v1/Coupon
// @access  Private admin and manager
exports.getCoupons = factory.getAll(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/v1/Coupon/:id
// @access  Private admin and manager
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/Coupon
// @access  Private
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific coupon
// @route   PUT /api/v1/Coupon/:id
// @access  Private admin and manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/v1/Coupon/:id
// @access  Private admin and manager
exports.deleteCoupon = factory.deleteOne(Coupon);
