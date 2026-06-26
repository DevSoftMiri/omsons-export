const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const { stripHtml } = require("../utils/text");
const { importProducts } = require("../services/productImport.service");
const { syncCategoryFromProductPayload } = require("../services/categorySync.service");

const createProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const product = await Product.create(payload);
  await syncCategoryFromProductPayload(payload);
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  await syncCategoryFromProductPayload(payload);
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, message: "Product deleted" });
});

const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ success: true, products });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.categorySlug }).sort({
    createdAt: -1,
  });
  res.json({ success: true, products });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.productSlug });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

const importProductsFromJson = asyncHandler(async (req, res) => {
  const { products } = req.body;
  const { summary, errors } = await importProducts(products);

  res.json({
    success: true,
    summary,
    errors,
  });
});

function normalizeProductPayload(payload = {}) {
  const descriptionHtml = String(payload.descriptionHtml || "").trim();
  const descriptionText = String(payload.description || "").trim() || stripHtml(descriptionHtml);

  return {
    externalId: String(payload.externalId || "").trim(),
    sku: String(payload.sku || "").trim(),
    name: String(payload.name || "").trim(),
    slug: String(payload.slug || payload.name || "").trim()
      ? slugify(payload.slug || payload.name)
      : "",
    mainCategory: String(payload.mainCategory || "").trim(),
    category: String(payload.category || "").trim(),
    categories: normalizeStringArray(payload.categories),
    page: normalizeNullableNumber(payload.page),
    mainImage: String(payload.mainImage || "").trim(),
    galleryImages: normalizeStringArray(payload.galleryImages),
    shortDescription: String(payload.shortDescription || "").trim(),
    description: descriptionText,
    descriptionHtml,
    features: normalizeStringArray(payload.features),
    options: Array.isArray(payload.options)
      ? payload.options.map((option) => ({
          title: String(option.title || "").trim(),
          type: String(option.type || "radio").trim(),
          values: normalizeStringArray(option.values),
        }))
      : [],
    priceList: Array.isArray(payload.priceList)
      ? payload.priceList.map((item) => ({
          model: String(item.model || "").trim(),
          price: String(item.price || "").trim(),
        }))
      : [],
    accessories: normalizeStringArray(payload.accessories),
    spareParts: normalizeStringArray(payload.spareParts),
    advantages: normalizeStringArray(payload.advantages),
    chartImages: normalizeStringArray(payload.chartImages),
    videos: normalizeStringArray(payload.videos),
    reviews: Array.isArray(payload.reviews)
      ? payload.reviews.map((review) => ({
          name: String(review.name || "").trim(),
          rating: Number(review.rating || 0),
          comment: String(review.comment || "").trim(),
        }))
      : [],
    variants: Array.isArray(payload.variants)
      ? payload.variants.map((variant) => ({
          externalId: String(variant.externalId || variant.id || "").trim(),
          sku: String(variant.sku || "").trim(),
          slug: String(variant.slug || variant.name || "").trim()
            ? slugify(variant.slug || variant.name)
            : "",
          name: String(variant.name || "").trim(),
          specs:
            variant.specs && typeof variant.specs === "object" && !Array.isArray(variant.specs)
              ? Object.fromEntries(
                  Object.entries(variant.specs)
                    .map(([key, value]) => [String(key).trim(), String(value ?? "").trim()])
                    .filter(([key, value]) => key && value)
                )
              : {},
          specsText: String(variant.specsText || "").trim(),
          pack: normalizeOptionalNumber(variant.pack),
          price: normalizeOptionalNumber(variant.price),
          priceLabel: String(variant.priceLabel || "").trim(),
          inStock: Boolean(variant.inStock),
          images: normalizeStringArray(variant.images),
        }))
      : [],
  };
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : undefined;
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductBySlug,
  importProductsFromJson,
};
