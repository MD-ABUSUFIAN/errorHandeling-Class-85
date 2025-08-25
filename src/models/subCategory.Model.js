const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true, // enforce unique at DB level
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ create slug before saving
subCategorySchema.pre("save", async function (next) {
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

// ✅ check duplicate slug manually
subCategorySchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.name} already exists in subCategory, try another one`
    );
  }
  next();
});

function autoPopulate(next) {
  this.populate({path:"category"})
  next()
}

subCategorySchema.pre("find", autoPopulate);

module.exports =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);

