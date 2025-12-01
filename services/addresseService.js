const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

// @desc    Add address to wishlist
// @route   POST /api/v1/addresses/:addressId
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true },
  );
  res
    .status(200)
    .json({ status: "success", message: "address added Successfully", data: user.addresses });
});

// @desc    Add address
// @route   delete /api/v1/addresses/:addressId
// @access  Private
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true },
  );
  res
    .status(200)
    .json({ status: "success", message: "address removed Successfully", data: user.addresses });
});

exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({ status: "success", results: user.addresses.length, data: user.addresses });
});

exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    return next(new ApiError(`Address not found for id ${req.params.addressId}`, 404));
  }
  address.set(req.body);
  await user.save();
  res
    .status(200)
    .json({ status: "success", message: "address updated Successfully", data: user.addresses });
});
