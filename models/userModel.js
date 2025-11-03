const mogoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const userSchema = new mogoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  // Hash the password before saving the user model
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  //  Generate slug automatically if missing
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true });
  }

  next();
});

const User = mogoose.model("User", userSchema);

module.exports = User;
