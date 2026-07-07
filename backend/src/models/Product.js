const mongoose = require("mongoose");

const productIconSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    tableColumns: [{ type: String, required: true, trim: true }],
    description: { type: String, default: "", trim: true },
    bulletPoints: [{ type: String, trim: true }],
    imageUrl: { type: String, default: "", trim: true },
    galleryImages: [{ type: String, trim: true }],
    icons: [productIconSchema],
    technicalTags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
