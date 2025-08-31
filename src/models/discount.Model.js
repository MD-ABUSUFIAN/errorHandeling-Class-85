const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

const discountSchema = new mongoose.Schema(
  {
    discountName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    discountType: {
      type: String,
      enum: ["tk", "%"], // টাকা বা পার্সেন্ট
      required: true,
    },

    discountValueByAmount: {
      type: Number,
      default: 0,
    },

    discountValueByPercent: {
      type: Number,
      default: 0,
    },

    discountPlan: {
      type: String,
      enum: ["category", "subCategory", "product"],
      required: true,
    },

    discountValidFrom: {
      type: Date,
      required: true,
    },

    discountValidTo: {
      type: Date,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ create slug before saving
discountSchema.pre("save", async function (next) {
  if (this.isModified("discountName")) {
    this.slug = slugify(this.discountName, {
      replacement: "-",
      lower: true,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

// ✅ check duplicate slug manually
discountSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.discountName} already exists in discount, try another one`
    );
  }
  next();
});

module.exports =
  mongoose.models.Discount || mongoose.model("Discount", discountSchema);
