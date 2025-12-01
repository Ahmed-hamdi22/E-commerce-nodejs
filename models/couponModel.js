const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name is required"],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    discount: {
      type: Number,
      required: [true, "Discount amount is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coupon", couponSchema);
