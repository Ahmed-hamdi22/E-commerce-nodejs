const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartItem: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: Number,
        price: Number,
        color: String,
      },
    ],
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    shippindAddress: {
      details: String,
      phone: String,
      postalCode: String,
      city: String,
    },
    totalOrderPrice: { type: Number, required: true },
    paymentMethodType: { type: String, enum: ["card", "cash"], default: "cash" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },

  { timestamps: true },
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email profileImg phone",
  }).populate({
    path: "cartItem.productId",
    select: "title imageCover price",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
