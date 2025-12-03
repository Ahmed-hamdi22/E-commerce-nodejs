const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    cartItem: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: Number,
        price: Number,
        color: String,
      },
    ],

    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    coupon: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Cart", cartSchema);
