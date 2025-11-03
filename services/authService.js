const crypto = require("crypto");
/* eslint-disable import/no-extraneous-dependencies */
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// @ desc    Signup user
// @ access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    role: req.body.role,
  });
  // 2- generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  // 3- send response to client side
  res.status(201).json({ data: user, token });
});

// @ desc    Login user
// @ access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1 - check if email and password exist
  //  check if user exists && password is correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  //  Check if user is active
  // if (user.active === false) {
  //   return next(new ApiError("This account has been deactivated. Please contact support.", 403));
  // }
  // 2 - generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  // 3- send response to client side
  res.status(200).json({ data: user, token });
});

// @ desc    Protect routes
// @ access  Private

exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(" headers Token", token);
  }
  if (!token) {
    return next(new ApiError("You are not logged in, please login to get access", 401));
  }

  // 2- verify token

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log("decoded", decoded);
  // 3- check if user still exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    console.log("currentUser", currentUser);

    return next(new ApiError("The user belonging to this token no longer exists", 401));
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);

    console.log(passChangedTimestamp, decoded.iat);
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError("User recently changed his password. please login again..", 401));
    }
  }

  req.user = currentUser;
  next();
});

// @ desc    Grant access to specific roles
// @ access  Private
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You are not allowed to access this route", 403));
    }
    next();
  });

// @ desc    Forget Password
// @ route   POST /api/v1/auth/forgetPassword
// @ access  Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`There is no user with email ${req.body.email}`, 404));
  }

  // 2) Generate random code (6 digits)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedResetCode = crypto.createHash("sha256").update(resetCode).digest("hex");

  console.log(resetCode);
  console.log(hashedResetCode);
  // 3) Save reset code to db
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetVerified = false;
  await user.save();

  // 4) Send reset code to user's email
  const message = `Hi ${user.name}, \n We received a request to reset your password on your E-Shop account. \n Your password reset code is \n ${resetCode} \n If you did not request a password reset, please ignore this email. \n Software Engineer Ahmed Hamdi.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Password reset code sent to your email",
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new ApiError("There was an error sending the email. Try again later", 500));
  }

  next();
});

// @ desc    Reset Password
// @ route   PUT /api/v1/auth/resetPassword
// @ access  Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on the reset code
  const hashedResetCode = crypto.createHash("sha256").update(req.body.resetCode).digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Password reset code is invalid or has expired", 400));
  }

  // Reset code is valid

  user.passwordResetVerified = true;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset code is valid",
  });
});

// @ desc    Reset Password
// @ route   PUT /api/v1/auth/resetCode
// @ access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError(`There is no user with email ${req.body.email}`, 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified yet", 400));
  }
  // 3) Update password

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // Generate token

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  res.status(200).json({
    status: "success",
    token,
  });
});
