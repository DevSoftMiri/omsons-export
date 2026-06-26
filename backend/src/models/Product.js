const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    externalId: String,
    sku: String,
    slug: String,
    name: String,
    specs: {
      type: Object,
      default: {},
    },
    specsText: String,
    pack: Number,
    price: Number,
    priceLabel: String,
    inStock: Boolean,
    images: [{ type: String }],
  },
  { _id: false }
);

const optionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: "radio" },
    values: [{ type: String }],
  },
  { _id: false }
);

const priceItemSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    price: { type: String, required: true },
  },
  { _id: false }
);

const reviewSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true },
    sku: String,
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    mainCategory: String,
    category: String,
    categories: [{ type: String }],
    page: Number,
    mainImage: String,
    galleryImages: [{ type: String }],
    shortDescription: String,
    description: String,
    descriptionHtml: String,
    features: [{ type: String }],
    specifications: [{ label: String, value: String }],
    options: [optionSchema],
    priceList: [priceItemSchema],
    accessories: [{ type: String }],
    spareParts: [{ type: String }],
    advantages: [{ type: String }],
    chartImages: [{ type: String }],
    videos: [{ type: String }],
    reviews: [reviewSnapshotSchema],
    variants: [variantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
