const express = require("express");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeCategoryImage,
} = require("../services/categoryService");

const AuthService = require("../services/authService");
const subCategoryRoute = require("./subCategoryRoute");

const router = express.Router();
router.use("/:categoryId/subcategories", subCategoryRoute);

router
  .route("/")
  .get(getCategories)
  .post(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeCategoryImage,
    (req, res, next) => {
      next();
    },
    createCategoryValidator,
    createCategory,
  );
router
  .route("/:id")
  .get(uploadCategoryImage, getCategoryValidator, getCategory)
  .put(
    AuthService.protect,
    AuthService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory,
  )
  .delete(
    AuthService.protect,
    AuthService.allowedTo("admin", "superadmin"),
    deleteCategoryValidator,
    deleteCategory,
  );

module.exports = router;
