const express = require("express");
const {
  createReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
  updateReviewValidator,
} = require("../utils/validators/reviewValidator");

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdToBody,
} = require("../services/reviewService");

const AuthService = require("../services/authService");

const router = express.Router({ mergeParams: true });

// /api/v1/reviews
router
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    AuthService.protect,
    AuthService.allowedTo("user"),
    setProductIdToBody,
    createReviewValidator,
    createReview,
  );

// /api/v1/reviews/:id
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(AuthService.protect, AuthService.allowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    AuthService.protect,
    AuthService.allowedTo("admin", "superadmin", "manager", "user"),
    deleteReviewValidator,
    deleteReview,
  );

module.exports = router;
