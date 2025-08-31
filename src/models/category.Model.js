const slugify = require('slugify');
const mongoose = require('mongoose');
const { customError } = require('../helpers/customError');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {},

    slug: {
      type: String,
      unique: true, // ✅ enforce unique at DB level
    },
    discount: {
      type: mongoose.Types.ObjectId,
      ref: 'Discount',
    },
    subCategory: [{ type: mongoose.Types.ObjectId, ref: 'SubCategory' }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// create slug before saving
categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      replacement: '-',
      lower: true, // ✅ lowercase is better
      strict: false,
      locale: 'vi',
      trim: true,
    });
  }
  next();
});

// check duplicate slug manually
categorySchema.pre('save', async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name} already exists, try another one`);
  }
  next();
});

module.exports =
  mongoose.models.Category || mongoose.model('Category', categorySchema);
