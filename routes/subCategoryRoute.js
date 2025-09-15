const express = require("express");
const {
  createSubCategory,
  getSubCategory,
  getsubCategories,
  updatesubCategory,
  deletesubCategory,
  setCategoryIdToBody,
  createFilterObject,
} = require("../services/subCategoryServices");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

// MergeParams allow to accsess the params of other route
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
  .get(createFilterObject, getsubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(updateSubCategoryValidator, updatesubCategory)
  .delete(deleteSubCategoryValidator, deletesubCategory);

module.exports = router;
