const mongoose = require("mongoose");
// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      maxlength: [30, "Name can not be more than 30 characters"],
      minlength: [3, "Name can not be less than 3 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// 2- Create model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
