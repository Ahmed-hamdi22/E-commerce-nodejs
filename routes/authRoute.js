const express = require("express");
const { SignUpValidator, LoginValidator } = require("../utils/validators/authValidator");
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  verifyResetCode,
} = require("../services/authService");

const router = express.Router();

router.post("/signup", SignUpValidator, signup);
router.post("/login", LoginValidator, login);
router.post("/forgetPassword", forgetPassword);
router.post("/verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;
