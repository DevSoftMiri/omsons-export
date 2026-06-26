const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const slugify = require("../utils/slugify");
const { syncCategoriesFromProducts } = require("../services/categorySync.service");

const createCategory = asyncHandler(async (req, res) => {
  const payload = normalizeCategoryPayload(req.body);
  const category = await Category.create(payload);
  res.status(201).json({ success: true, category });
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1, createdAt: -1 });
  res.json({ success: true, categories });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const payload = normalizeCategoryPayload(req.body);
  const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true });

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, message: "Category deleted" });
});

const syncCategoryCollection = asyncHandler(async (_req, res) => {
  const result = await syncCategoriesFromProducts();
  res.json({ success: true, ...result });
});

function normalizeCategoryPayload(payload = {}) {
  return {
    name: String(payload.name || "").trim(),
    slug: String(payload.slug || payload.name || "").trim()
      ? slugify(payload.slug || payload.name)
      : "",
    mainCategory: String(payload.mainCategory || "").trim(),
    submenuTitle: String(payload.submenuTitle || "").trim(),
    heroImage: String(payload.heroImage || "").trim(),
    description: String(payload.description || "").trim(),
  };
}

module.exports = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  syncCategoryCollection,
};
