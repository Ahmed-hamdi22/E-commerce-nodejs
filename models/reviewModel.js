const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
  },
  { timestamps: true },
);
// For return user data when get reviews { populate user data }
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg",
  });
  next();
});

// Static method to calculate average ratings and ratings quantity
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      // use math.ceil to round up the average rating to nearest integer

      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].ratingsQuantity,
    });
  } else {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
// Post save hook to calculate average ratings after a new review is added
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});
// Post remove hook to recalculate average ratings after a review is deleted
reviewSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
