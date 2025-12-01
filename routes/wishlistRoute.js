const express = require("express");
// const {
//   getBrandValidator,
//   createBrandValidator,
//   updateBrandValidator,
//   deleteBrandValidator,
// } = require("../utils/validators/brandValidator");

const AuthService = require("../services/authService");
const {
  addToWishlist,
  removeToWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");

const router = express.Router();

router.use(AuthService.protect, AuthService.allowedTo("user"));

router.route("/").post(addToWishlist).get(getLoggedUserWishlist);
router.delete("/:productId", removeToWishlist);

module.exports = router;
