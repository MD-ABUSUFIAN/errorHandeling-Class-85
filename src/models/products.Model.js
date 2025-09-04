const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

// ✅ Define reviewSchema separately
const reviewSchema = new mongoose.Schema(
  {
    reviewerid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, trim: true, maxlength: 500 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

// ✅ Define productSchema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, trim: true },
    barCode: { type: String, trim: true },

    groupUnit: {
      type: String,
      enum: ["Box", "Packet", "Dozen", "Custom"],
    },
    groupUnitQuantity: { type: Number, default: 1 },
    unit: {
      type: String,
      enum: ["Piece", "Kg", "Gram", "Packet", "Liter"],
    },

    size: [{ type: String }],
    color: [{ type: String }],
    totalStock: { type: Number, default: 0 },
    warehouseLocation: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },

    reviews: [reviewSchema],

    sku: { type: String, trim: true, unique: true },
    purchasePrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    wholeSalePrice: { type: Number },
    minimumWholeSaleOrderQuantity: { type: Number, min: 100 },
    minimumuomrde: { type: Number },

    instock: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    discount: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },

    image: [], // Consider changing this to an array of file paths
    tag: [{ type: String }],
    manufactureCountry: { type: String },

    rating: { type: Number, max: 5, default: 0 },
  },
  { timestamps: true }
);

// ✅ Add slug before saving
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

// ✅ Check duplicate slug manually
productSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.name} already exists in products, try another one`
    );
  }
  next();
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
