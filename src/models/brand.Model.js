const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true, // enforce unique slug
    },

    image: {},

    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

// ✅ create slug before saving
brandSchema.pre("save", async function (next) {
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
brandSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.name} already exists in brand, try another one`
    );
  }
  next();
});

module.exports =
  mongoose.models.Brand || mongoose.model("Brand", brandSchema);
