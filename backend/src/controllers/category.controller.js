const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductRow = require("../models/ProductRow");
const slugify = require("../utils/slugify");

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  res.json({ success: true, categories });
});

const getCatalogueCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const categoryIds = categories.map((category) => category._id);
  const products = await Product.find({ categoryId: { $in: categoryIds }, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const rows = await ProductRow.find({
    productId: { $in: products.map((product) => product._id) },
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const productMap = groupProductsByCategory(products, rows, categories);

  res.json({
    success: true,
    categories: categories.map((category) => ({
      ...category,
      products: productMap[String(category._id)] || [],
    })),
  });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const products = await Product.find({ categoryId: category._id, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  const rows = await ProductRow.find({
    productId: { $in: products.map((product) => product._id) },
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const grouped = groupProductsByCategory(products, rows, [category]);
  res.json({
    success: true,
    category: {
      ...category,
      products: grouped[String(category._id)] || [],
    },
  });
});

const getCategoryForAdmin = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const productCount = await Product.countDocuments({ categoryId: category._id });

  res.json({
    success: true,
    category: {
      ...category,
      productCount,
    },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = await normalizeCategoryPayload(req.body);
  const sortOrder = await getNextSortOrder();

  const category = await Category.create({
    ...payload,
    sortOrder: Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : sortOrder,
  });

  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const payload = await normalizeCategoryPayload(req.body, existing._id);
  existing.set({
    ...payload,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, existing.sortOrder),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : existing.isActive,
  });

  await existing.save();
  res.json({ success: true, category: existing });
});

const updateCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(req.body.isActive) },
    { new: true }
  );

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

  const products = await Product.find({ categoryId: category._id }, "_id").lean();
  await ProductRow.deleteMany({ productId: { $in: products.map((product) => product._id) } });
  await Product.deleteMany({ categoryId: category._id });

  res.json({ success: true, message: "Category deleted" });
});

const reorderCategories = asyncHandler(async (req, res) => {
  const categoryIds = Array.isArray(req.body.categoryIds) ? req.body.categoryIds : [];

  await Promise.all(
    categoryIds.map((id, index) => Category.findByIdAndUpdate(id, { sortOrder: index + 1 }))
  );

  res.json({ success: true });
});

async function normalizeCategoryPayload(payload = {}, currentCategoryId = null) {
  const name = String(payload.name || "").trim();

  if (!name) {
    throw validationError("Category name is required");
  }

  const slugValue = String(payload.slug || payload.name || "").trim();
  const slug = slugValue ? slugify(slugValue) : "";

  if (!slug) {
    throw validationError("Category slug is required");
  }

  const existingSlug = await Category.findOne({
    slug,
    ...(currentCategoryId ? { _id: { $ne: currentCategoryId } } : {}),
  }).lean();

  if (existingSlug) {
    throw validationError("Category slug must be unique");
  }

  const tableColumns = normalizeStringArray(payload.tableColumns);

  if (!tableColumns.length) {
    throw validationError("At least one table column is required");
  }

  return {
    name,
    slug,
    description: String(payload.description || "").trim(),
    bulletPoints: normalizeStringArray(payload.bulletPoints),
    imageUrl: String(payload.imageUrl || "").trim(),
    icons: normalizeIcons(payload.icons),
    tableColumns,
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
  };
}

function groupProductsByCategory(products, rows, categories) {
  const rowMap = rows.reduce((accumulator, row) => {
    const key = String(row.productId);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(row);
    return accumulator;
  }, {});

  const categoryMap = new Map(categories.map((category) => [String(category._id), category]));

  return products.reduce((accumulator, product) => {
    const category = categoryMap.get(String(product.categoryId));
    const key = String(product.categoryId);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      tableColumns: product.tableColumns || category?.tableColumns || [],
      description: product.description || "",
      bulletPoints: product.bulletPoints || [],
      imageUrl: product.imageUrl || "",
      galleryImages: product.galleryImages || [],
      itemsSupplied: product.itemsSupplied || [],
      accessoriesSpareParts: product.accessoriesSpareParts || [],
      selectionCharts: product.selectionCharts || [],
      videos: product.videos || [],
      downloads: product.downloads || [],
      icons: product.icons || [],
      technicalTags: product.technicalTags || [],
      isActive: Boolean(product.isActive),
      sortOrder: product.sortOrder || 0,
      categoryId: product.categoryId,
      category: category
        ? {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            tableColumns: category.tableColumns || [],
          }
        : null,
      rows: (rowMap[String(product._id)] || []).map((row) => ({
        _id: row._id,
        sortOrder: row.sortOrder || 0,
        isActive: Boolean(row.isActive),
        values: normalizeRowValues(
          row.values,
          product.tableColumns || category?.tableColumns || []
        ),
      })),
    });
    return accumulator;
  }, {});
}

function normalizeRowValues(values, tableColumns) {
  const source = values && typeof values === "object" ? values : {};

  return tableColumns.reduce((accumulator, column) => {
    accumulator[column] = String(source[column] ?? "").trim();
    return accumulator;
  }, {});
}

function normalizeIcons(icons) {
  if (!Array.isArray(icons)) {
    return [];
  }

  return icons
    .map((icon) => ({
      label: String(icon?.label || "").trim(),
      imageUrl: String(icon?.imageUrl || "").trim(),
    }))
    .filter((icon) => icon.label);
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))]
    : [];
}

function normalizeOptionalNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getNextSortOrder() {
  const lastCategory = await Category.findOne().sort({ sortOrder: -1 }).lean();
  return (lastCategory?.sortOrder || 0) + 1;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

module.exports = {
  createCategory,
  deleteCategory,
  getCatalogueCategories,
  getCategories,
  getCategoryBySlug,
  getCategoryForAdmin,
  reorderCategories,
  updateCategory,
  updateCategoryStatus,
};
