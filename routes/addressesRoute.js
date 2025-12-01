const express = require("express");
// const {
//   getBrandValidator,
//   createBrandValidator,
//   updateBrandValidator,
//   deleteBrandValidator,
// } = require("../utils/validators/brandValidator");

const AuthService = require("../services/authService");
const {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
  updateAddress,
} = require("../services/addresseService");

const router = express.Router();

router.use(AuthService.protect, AuthService.allowedTo("user"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", removeAddress);

module.exports = router;
