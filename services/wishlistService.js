const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true },
  );
  res
    .status(200)
    .json({ status: "success", message: "Product added to wishlist", data: user.wishlist });
});

// @desc    Add product to wishlist
// @route   delete /api/v1/wishlist/:productId
// @access  Private
exports.removeToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true },
  );
  res
    .status(200)
    .json({ status: "success", message: "Product removed from wishlist", data: user.wishlist });
});

exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.status(200).json({ status: "success", results: user.wishlist.length, data: user.wishlist });
});
