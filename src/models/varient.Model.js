const slugify = require('slugify');
const mongoose = require('mongoose');
const { customError } = require('../helpers/customError');
const { required } = require('joi');

const variantSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    variantName: {
      type: String,
      required: true,
      trim: true,
    },

    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    sku: { type: String, trim: true,required:true},
    barCode: { type: String, trim: true },
    qrCode: { type: String, trim: true },

    size: { type: String, trim: true,required:true },
    color: [{ type: String, trim: true,required:true }],

    stockVariant: { type: Number, default: 0, required: true },

    warehouseLocation: {
      type: mongoose.Types.ObjectId,
      ref: 'Warehouse',
    },
    image: [{}],

    alertVariantStock: { type: Number, default: 0 },

    purchasePrice: { type: Number, default: 0 },
    retailPrice: { type: Number, default: 0 },
    wholeSalePrice: { type: Number, default: 0 },
    stockAlert: { type: Boolean, default: false },
    instock: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// create slug before saving
variantSchema.pre('save', async function (next) {
  if (this.isModified('variantName')) {
    this.slug = slugify(this.variantName, {
      replacement: '-',
      lower: true,
      strict: false,
      locale: 'vi',
      trim: true,
    });
  }
  next();
});

// check duplicate slug manually
variantSchema.pre('save', async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.variantName} already exists, try another one`
    );
  }
  next();
});

module.exports =
  mongoose.models.Variant || mongoose.model('Variant', variantSchema);
