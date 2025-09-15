const mongose = require("mongoose");

const subCategorySchema = new mongose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "SubCategory name must be unique"],
      maxlength: [30, "Name can not be more than 30 characters"],
      minlength: [3, "Name can not be less than 3 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to a Category"],
    },
  },

  { timestamps: true },
);

module.exports = mongose.model("SubCategory", subCategorySchema);
