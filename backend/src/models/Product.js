const mongoose = require("mongoose");

const productIconSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const productDetailSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    contentType: {
      type: String,
      enum: ["paragraph", "points"],
      default: "paragraph",
    },
    paragraph: { type: String, default: "", trim: true },
    points: [{ type: String, trim: true }],
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productHighlightCardSchema = new mongoose.Schema(
  {
    featureCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeatureCard",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productDownloadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
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
    imagePublicId: { type: String, default: "", trim: true },
    galleryImages: [{ type: String, trim: true }],
    detailSections: [productDetailSectionSchema],
    highlightCards: [productHighlightCardSchema],
    specifications: [{ type: String, trim: true }],
    itemsSupplied: [{ type: String, trim: true }],
    accessoriesSpareParts: [{ type: String, trim: true }],
    selectionCharts: [{ type: String, trim: true }],
    videos: [{ type: String, trim: true }],
    downloads: [productDownloadSchema],
    brochureUrl: { type: String, default: "", trim: true },
    coqUrl: { type: String, default: "", trim: true },
    icons: [productIconSchema],
    featureCardIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeatureCard",
      },
    ],
    technicalTags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ categoryId: 1, isActive: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
