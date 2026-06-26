const mongoose = require("mongoose");

const productRowSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    values: {
      type: Object,
      default: {},
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProductRow || mongoose.model("ProductRow", productRowSchema);
