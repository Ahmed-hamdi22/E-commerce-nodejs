const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Review = require("../../models/reviewModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

// Validate create Review
// POST /api/v1/reviews
// Private / User
exports.createReviewValidator = [
  // check id user in body
  // don't need to check because we set it in service from logged user
  body("user").isMongoId().withMessage("Invalid User id format"),

  check("title").optional(),
  check("rating")
    .notEmpty()
    .withMessage("Review rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review rating must be between 1 and 5"),

  check("product")
    .isMongoId()
    .withMessage("Invalid Product id format")
    .custom((val, { req }) =>
      // Check if logged user create review before
      Review.findOne({ user: req.user._id, product: req.body.product }).then((review) => {
        if (review) {
          return Promise.reject(new Error("You already created a review for this product"));
        }
      }),
    ),

  validatorMiddleware,
];

// Validate update Review
// put /api/v1/reviews/:id
// Private /user
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      // Check if logged user update his review
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`Review not found for id: ${val}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error("You are not allowed to update this review"));
        }
      }),
    ),
  validatorMiddleware,
];

// Validate delete Review
// delete /api/v1/reviews/:id
// Private /user /admin /manager /superadmin
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      // Check if logged user delete his review
      if (req.user.role === "user") {
        // Check if logged user delete his review
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(new Error(`Review not found for id: ${val}`));
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(new Error("You are not allowed to delete this review"));
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
