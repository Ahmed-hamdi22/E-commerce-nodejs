const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getloggedUserData,
  updateMyPassword,
  updateLoggedUser,
  deleteLoggedUser,
  reactivateUser,
} = require("../services/userService");
const AuthService = require("../services/authService");

const router = express.Router();

router.get("/getme", AuthService.protect, getloggedUserData, getUser);
router.put("/changeMyPassword", AuthService.protect, updateMyPassword);
router.put(
  "/updateMe",
  AuthService.protect,
  uploadUserImage,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUser,
);
router.delete("/deleteMe", AuthService.protect, deleteLoggedUser);
router.put("/reactivateMe", AuthService.protect, reactivateUser);

// Protect all routes after this middleware (admin, manager, superadmin)
router.use(AuthService.protect, AuthService.allowedTo("admin", "manager", "superadmin"));

// Change Password
router.put("/changePassword/:id", changeUserPasswordValidator, changeUserPassword);

router
  .route("/")
  .get(getUserValidator, getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(AuthService.protect, AuthService.allowedTo("admin", "manager", "superadmin"), getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
