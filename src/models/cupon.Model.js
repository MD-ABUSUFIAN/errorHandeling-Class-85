const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

const couponSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "tk"], // percentage or fixed amount
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    expireAt: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: 0, // 0 means unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ create slug before saving
couponSchema.pre("save", async function (next) {
  if (this.isModified("code")) {
    this.slug = slugify(this.code, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// ✅ check duplicate slug manually
couponSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.code} already exists in coupon, try another one`
    );
  }
  next();
});

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
