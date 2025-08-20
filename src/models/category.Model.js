const slugify = require("slugify");
const mongoose = require("mongoose");
const { customError } = require("../helpers/customError");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: { type: String, default: "" },

    slug: {
      type: String,
      unique: true, // ✅ enforce unique at DB level
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// create slug before saving
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true, // ✅ lowercase is better
      strict: false,
      locale:"vi",
      trim: true,
    });
  }
  next();
});

// check duplicate slug manually
categorySchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name} already exists, try another one`)
  }
  next();
});

module.exports =
  mongoose.models.category || mongoose.model("category", categorySchema);
