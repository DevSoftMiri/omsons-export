const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductRow = require("../models/ProductRow");
const slugify = require("../utils/slugify");

const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await fetchProducts({});
  res.json({ success: true, products });
});

const getAdminProductList = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 24, 1), 100);
  const search = String(req.query.search || "").trim();
  const categorySlug = String(req.query.category || "").trim();

  const filter = await buildAdminProductFilter({ search, categorySlug });
  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * pageSize;

  const products = await Product.find(filter)
    .select("name slug description bulletPoints imageUrl categoryId sortOrder isActive createdAt")
    .populate({ path: "categoryId", select: "name slug" })
    .sort({ sortOrder: 1, createdAt: 1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const productIds = products.map((product) => product._id);
  const rowCounts = productIds.length
    ? await ProductRow.aggregate([
        { $match: { productId: { $in: productIds }, isActive: true } },
        { $group: { _id: "$productId", count: { $sum: 1 } } },
      ])
    : [];

  const rowCountMap = rowCounts.reduce((accumulator, item) => {
    accumulator[String(item._id)] = item.count;
    return accumulator;
  }, {});

  const categoryCounts = await Product.aggregate([
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    { $sort: { "category.name": 1 } },
  ]);

  res.json({
    success: true,
    products: products.map((product) => serializeAdminListProduct(product, rowCountMap[String(product._id)] || 0)),
    filters: categoryCounts.map((item) => ({
      slug: item.category.slug,
      label: item.category.name,
      count: item.count,
    })),
    pagination: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.categorySlug }).lean();

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const products = await fetchProducts({ categoryId: category._id, isActive: true });
  res.json({ success: true, products });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await fetchSingleProduct({ slug: req.params.productSlug, isActive: true });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

const getProductForAdmin = asyncHandler(async (req, res) => {
  const product = await fetchSingleProduct({ _id: req.params.id });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = await normalizeProductPayload(req.body);
  const sortOrder = await getNextProductSortOrder(payload.categoryId);

  const product = await Product.create({
    ...payload.product,
    categoryId: payload.categoryId,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, sortOrder),
  });

  const rows = await replaceProductRows(product._id, payload.rows);
  const responseProduct = await buildSerializedProduct(product.toObject(), rows, payload.category);

  res.status(201).json({ success: true, product: responseProduct });
});

const updateProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);

  if (!existing) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const payload = await normalizeProductPayload(req.body, existing._id);
  existing.set({
    ...payload.product,
    categoryId: payload.categoryId,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, existing.sortOrder),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : existing.isActive,
  });

  await existing.save();
  const rows = await replaceProductRows(existing._id, payload.rows);
  const responseProduct = await buildSerializedProduct(existing.toObject(), rows, payload.category);

  res.json({ success: true, product: responseProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  await ProductRow.deleteMany({ productId: product._id });
  res.json({ success: true, message: "Product deleted" });
});

const addProductRow = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const values = normalizeRowValues(req.body.values, product.tableColumns || []);
  const row = await ProductRow.create({
    productId: product._id,
    values,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, await getNextRowSortOrder(product._id)),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : true,
  });

  res.status(201).json({ success: true, row });
});

const updateProductRow = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const row = await ProductRow.findOne({ _id: req.params.rowId, productId: product._id });

  if (!row) {
    return res.status(404).json({ success: false, message: "Row not found" });
  }

  row.set({
    values: normalizeRowValues(req.body.values, product.tableColumns || []),
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, row.sortOrder),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : row.isActive,
  });

  await row.save();
  res.json({ success: true, row });
});

const deleteProductRow = asyncHandler(async (req, res) => {
  const row = await ProductRow.findOneAndDelete({
    _id: req.params.rowId,
    productId: req.params.id,
  });

  if (!row) {
    return res.status(404).json({ success: false, message: "Row not found" });
  }

  res.json({ success: true, message: "Row deleted" });
});

const reorderProductRows = asyncHandler(async (req, res) => {
  const rowIds = Array.isArray(req.body.rowIds) ? req.body.rowIds : [];

  await Promise.all(
    rowIds.map((id, index) =>
      ProductRow.findOneAndUpdate(
        { _id: id, productId: req.params.id },
        { sortOrder: index + 1 }
      )
    )
  );

  res.json({ success: true });
});

async function fetchProducts(filter) {
  const products = await Product.find(filter)
    .populate("categoryId")
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const rows = await ProductRow.find({
    productId: { $in: products.map((product) => product._id) },
    isActive: true,
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const rowMap = rows.reduce((accumulator, row) => {
    const key = String(row.productId);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(row);
    return accumulator;
  }, {});

  return products.map((product) =>
    serializeProduct(product, rowMap[String(product._id)] || [], product.categoryId)
  );
}

async function buildAdminProductFilter({ search, categorySlug }) {
  const filter = {};

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).select("_id").lean();
    filter.categoryId = category?._id || null;
  }

  if (!search) {
    return filter;
  }

  const searchRegex = new RegExp(escapeRegex(search), "i");
  const matchingCategories = await Category.find({ name: searchRegex }).select("_id").lean();
  const categoryIds = matchingCategories.map((category) => category._id);

  filter.$or = [
    { name: searchRegex },
    { slug: searchRegex },
    ...(categoryIds.length ? [{ categoryId: { $in: categoryIds } }] : []),
  ];

  return filter;
}

async function fetchSingleProduct(filter) {
  const product = await Product.findOne(filter).populate("categoryId").lean();

  if (!product) {
    return null;
  }

  const rows = await ProductRow.find({ productId: product._id, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return serializeProduct(product, rows, product.categoryId);
}

async function buildSerializedProduct(product, rows, category) {
  return serializeProduct(
    {
      ...product,
      categoryId: category,
    },
    rows,
    category
  );
}

async function normalizeProductPayload(payload = {}, currentProductId = null) {
  const name = String(payload.name || "").trim();

  if (!name) {
    throw validationError("Product name is required");
  }

  const categoryId = String(payload.categoryId || "").trim();

  if (!categoryId) {
    throw validationError("Category is required");
  }

  const category = await Category.findById(categoryId).lean();

  if (!category) {
    throw validationError("Selected category does not exist");
  }

  const slugValue = String(payload.slug || payload.name || "").trim();
  const slug = slugValue ? slugify(slugValue) : "";

  if (!slug) {
    throw validationError("Product slug is required");
  }

  const existingSlug = await Product.findOne({
    slug,
    ...(currentProductId ? { _id: { $ne: currentProductId } } : {}),
  }).lean();

  if (existingSlug) {
    throw validationError("Product slug must be unique");
  }

  const tableColumns = normalizeStringArray(payload.tableColumns).length
    ? normalizeStringArray(payload.tableColumns)
    : category.tableColumns;

  if (!tableColumns.length) {
    throw validationError("At least one table column is required");
  }

  const rows = normalizeRows(payload.rows, tableColumns);

  return {
    categoryId,
    category,
    product: {
      name,
      slug,
      tableColumns,
      description: String(payload.description || "").trim(),
      bulletPoints: normalizeStringArray(payload.bulletPoints),
      imageUrl: String(payload.imageUrl || "").trim(),
      itemsSupplied: normalizeStringArray(payload.itemsSupplied),
      accessoriesSpareParts: normalizeStringArray(payload.accessoriesSpareParts),
      selectionCharts: normalizeStringArray(payload.selectionCharts),
      videos: normalizeStringArray(payload.videos),
      downloads: normalizeStringArray(payload.downloads),
      icons: normalizeIcons(payload.icons),
      technicalTags: normalizeStringArray(payload.technicalTags),
      isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
      ...(Array.isArray(payload.galleryImages)
        ? { galleryImages: normalizeStringArray(payload.galleryImages) }
        : {}),
    },
    rows,
  };
}

function serializeProduct(product, rows = [], category = null) {
  const categoryRecord = category
    ? {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        tableColumns: category.tableColumns || [],
      }
    : null;

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    tableColumns: product.tableColumns || categoryRecord?.tableColumns || [],
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
    categoryId: categoryRecord?._id || null,
    category: categoryRecord,
      rows: rows.map((row) => ({
        _id: row._id,
        sortOrder: row.sortOrder || 0,
        isActive: Boolean(row.isActive),
        values: normalizeRowValues(
          row.values,
          product.tableColumns || categoryRecord?.tableColumns || []
        ),
      })),
  };
}

function serializeAdminListProduct(product, rowCount = 0) {
  const category = product.categoryId
    ? {
        _id: product.categoryId._id,
        name: product.categoryId.name,
        slug: product.categoryId.slug,
      }
    : null;

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    bulletPoints: product.bulletPoints || [],
    imageUrl: product.imageUrl || "",
    isActive: Boolean(product.isActive),
    sortOrder: product.sortOrder || 0,
    categoryId: category?._id || null,
    category,
    rowCount,
  };
}

function normalizeRows(rows, tableColumns) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row, index) => ({
    values: normalizeRowValues(row?.values, tableColumns),
    sortOrder: normalizeOptionalNumber(row?.sortOrder, index + 1),
    isActive: typeof row?.isActive === "boolean" ? row.isActive : true,
  }));
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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOptionalNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function replaceProductRows(productId, rows) {
  await ProductRow.deleteMany({ productId });

  if (!rows.length) {
    return [];
  }

  return ProductRow.insertMany(
    rows.map((row, index) => ({
      productId,
      values: row.values,
      sortOrder: normalizeOptionalNumber(row.sortOrder, index + 1),
      isActive: typeof row.isActive === "boolean" ? row.isActive : true,
    }))
  );
}

async function getNextProductSortOrder(categoryId) {
  const lastProduct = await Product.findOne({ categoryId }).sort({ sortOrder: -1 }).lean();
  return (lastProduct?.sortOrder || 0) + 1;
}

async function getNextRowSortOrder(productId) {
  const lastRow = await ProductRow.findOne({ productId }).sort({ sortOrder: -1 }).lean();
  return (lastRow?.sortOrder || 0) + 1;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

module.exports = {
  addProductRow,
  createProduct,
  deleteProduct,
  getAdminProductList,
  deleteProductRow,
  getAllProducts,
  getProductBySlug,
  getProductForAdmin,
  getProductsByCategory,
  reorderProductRows,
  updateProduct,
  updateProductRow,
};
