const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Coupon = require("../../models/couponModel");

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  validatorMiddleware,
];

exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("Coupon name is required")
    .toUpperCase()
    .custom(async (val) => {
      const coupon = await Coupon.findOne({ name: val });
      if (coupon) {
        throw new Error("Coupon name must be unique");
      }
      return true;
    }),
  check("expire")
    .notEmpty()
    .withMessage("Coupon expiration date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Invalid date format, please use YYYY-MM-DD")
    .custom((val) => {
      if (Date.parse(val) < Date.now()) {
        throw new Error("Expiration date must be in the future");
      }
      return true;
    }),
  check("discount")
    .notEmpty()
    .withMessage("Coupon discount is required")
    .isNumeric()
    .withMessage("Discount must be a number"),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  validatorMiddleware,
];
