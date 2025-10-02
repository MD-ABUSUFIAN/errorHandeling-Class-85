const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    guestId: {
      type: String,
      trim: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
         
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant", // optional: if you store product variations separately
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          min: 0,
        },
        total: {
          type: Number,
          min: 0,
        },
        size: {
          type: String,
          default: "N/A",
      },
        color: {
          type: String,
          default: "N/A",
        },
      },
    ],

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    afterApplyCouponPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ auto-calculate item total & cart totals
cartSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.total = item.price * item.quantity;
  });

  this.totalPrice = this.items.reduce((acc, item) => acc + item.total, 0);

  if (this.discountPrice > this.totalPrice) {
    this.discountPrice = this.totalPrice; // prevent negative
  }

  this.afterApplyCouponPrice = this.totalPrice - this.discountPrice;
  next();
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
