/* eslint-disable import/no-unresolved */
const sharp = require("sharp");
const slugify = require("slugify");

// eslint-disable-next-line node/no-missing-require
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const factory = require("./handlersFactory");
const User = require("../models/userModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${fileName}`);
  }

  // Save image into our db
  req.body.profileImg = fileName;

  next();
});
// @desc    Get list of Users
// @route   GET /api/v1/User
// @access  private
exports.getUsers = factory.getAll(User);

// @desc    Get specific User by id
// @route   GET /api/v1/Users/:id
// @access  Public
exports.getUser = factory.getOne(User);

// @desc    Create User
// @route   POST  /api/v1/Users
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update specific User
// @route   PUT /api/v1/Users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    },
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Change User Password
// @route   PUT /api/v1/Users/:id
// @access  Private
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
  }

  // 2) Check if Posted current password is correct
  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isMatch) {
    return next(new ApiError("Current password is incorrect", 400));
  }

  // 3) Check if new password is different from current password
  const isSame = await bcrypt.compare(req.body.password, user.password);
  if (isSame) {
    return next(new ApiError("New password must be different from the old one", 400));
  }

  // Update password
  user.password = await bcrypt.hash(req.body.password, 10);
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});
// @desc    Delete specific User
// @route   DELETE /api/v1/Users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);

// @desc    Get logged user data
// @route   GET /api/v1/users/me
// @access  Private
exports.getloggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;

  next();
});

// @desc    Update logged user data
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private
exports.updateMyPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.passwordChangedAt = Date.now();
  await user.save();

  // Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    token,
  });
});

// @desc    Update logged user data
// @route   PUT /api/v1/users/updateMe
// @access  Private
exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      slug: req.body.slug,
    },

    { new: true },
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Delete logged user account
// @route   DELETE /api/v1/users/deleteMe
// @access  Private
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "success", data: null });
});

// @desc    Reactivate user
// @route   PUT /api/v1/users/reactivateMe
// @access
exports.reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: true }, { new: true });
  res.status(200).json({ status: "Account reactivated successfully", data: user });
});
