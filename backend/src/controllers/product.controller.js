const asyncHandler = require("../utils/asyncHandler");
const Category = require("../models/Category");
const FeatureCard = require("../models/FeatureCard");
const Product = require("../models/Product");
const ProductRow = require("../models/ProductRow");
const slugify = require("../utils/slugify");
const cloudinary = require("../config/cloudinary");

const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await fetchProducts({});
  res.json({ success: true, products });
});

const searchProducts = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim();
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 8, 1), 20);

  if (query.length < 2) {
    return res.json({ success: true, products: [] });
  }

  const pattern = new RegExp(escapeRegex(query), "i");
  const products = await Product.find({
    isActive: true,
    $or: [{ name: pattern }, { slug: pattern }],
  })
    .select("name slug imageUrl galleryImages categoryId")
    .populate({ path: "categoryId", select: "name slug" })
    .sort({ name: 1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    products: products.map((product) => ({
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl || product.galleryImages?.[0] || "",
      category: product.categoryId
        ? { name: product.categoryId.name, slug: product.categoryId.slug }
        : null,
    })),
  });
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
    .select(
      "name slug description bulletPoints imageUrl galleryImages categoryId brochureUrl coqUrl sortOrder isActive createdAt"
    )
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
  const category = await findCategoryBySlug(req.params.categorySlug);

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const products = await fetchProducts({ categoryId: category._id, isActive: true });
  res.json({ success: true, products });
});

async function findCategoryBySlug(value) {
  const requestedSlug = slugify(value);
  const candidates = [requestedSlug];

  if (requestedSlug.endsWith("ies")) {
    candidates.push(`${requestedSlug.slice(0, -3)}y`);
  } else if (requestedSlug.endsWith("s")) {
    candidates.push(requestedSlug.slice(0, -1));
  }

  return Category.findOne({ slug: { $in: [...new Set(candidates)] } }).lean();
}

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

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError("Product image is required");
  }

  const previousPublicId = String(req.body.previousPublicId || "").trim();
  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: "omsons/products",
    resource_type: "image",
  });

  if (previousPublicId && previousPublicId !== uploaded.public_id) {
    await destroyCloudinaryAsset(previousPublicId);
  }

  res.status(201).json({
    success: true,
    imageUrl: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = await normalizeProductPayload(req.body);
  const sortOrder = await getNextProductSortOrder(payload.categoryId);

  const product = await Product.create({
    ...payload.product,
    categoryId: payload.categoryId,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, sortOrder),
  });

  await replaceProductRows(product._id, payload.rows);
  const responseProduct = await fetchSingleProduct({ _id: product._id });

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
  await replaceProductRows(existing._id, payload.rows);
  const responseProduct = await fetchSingleProduct({ _id: existing._id });

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
    .populate({ path: "featureCardIds", select: "name imageUrl isActive sortOrder" })
    .populate({ path: "highlightCards.featureCardId", select: "name imageUrl isActive sortOrder" })
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
  const product = await Product.findOne(filter)
    .populate("categoryId")
    .populate({ path: "featureCardIds", select: "name imageUrl isActive sortOrder" })
    .populate({ path: "highlightCards.featureCardId", select: "name imageUrl isActive sortOrder" })
    .lean();

  if (!product) {
    return null;
  }

  const rows = await ProductRow.find({ productId: product._id, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return serializeProduct(product, rows, product.categoryId);
}

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

async function destroyCloudinaryAsset(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (_error) {
    // If cleanup fails we still keep the new uploaded image and saved URL intact.
  }
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
  const featureCardIds = await normalizeFeatureCardIds(payload.featureCardIds);
  const highlightCards = await normalizeHighlightCards(payload.highlightCards);

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
      imagePublicId: String(payload.imagePublicId || "").trim(),
      detailSections: normalizeDetailSections(payload.detailSections),
      highlightCards,
      specifications: normalizeStringArray(payload.specifications),
      itemsSupplied: normalizeStringArray(payload.itemsSupplied),
      accessoriesSpareParts: normalizeStringArray(payload.accessoriesSpareParts),
      selectionCharts: normalizeStringArray(payload.selectionCharts),
      videos: normalizeStringArray(payload.videos),
      downloads: normalizeDownloads(payload.downloads),
      brochureUrl: normalizeExternalUrl(payload.brochureUrl),
      coqUrl: normalizeExternalUrl(payload.coqUrl),
      icons: normalizeIcons(payload.icons),
      featureCardIds,
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
    imagePublicId: product.imagePublicId || "",
    galleryImages: product.galleryImages || [],
    detailSections: product.detailSections || [],
    highlightCards: serializeHighlightCards(product.highlightCards || []),
    specifications:
      product.specifications?.length ? product.specifications : product.itemsSupplied || [],
    itemsSupplied: product.itemsSupplied || [],
    accessoriesSpareParts: product.accessoriesSpareParts || [],
    selectionCharts: product.selectionCharts || [],
    videos: product.videos || [],
    downloads: serializeDownloads(product.downloads || []),
    brochureUrl: product.brochureUrl || "",
    coqUrl: product.coqUrl || "",
    icons: product.icons || [],
    featureCards: serializeFeatureCards(product.featureCardIds || []),
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
    imagePublicId: product.imagePublicId || "",
    galleryImages: product.galleryImages || [],
    brochureUrl: product.brochureUrl || "",
    coqUrl: product.coqUrl || "",
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

function normalizeDownloads(downloads) {
  if (!Array.isArray(downloads)) {
    return [];
  }

  return downloads
    .map((item) => {
      if (typeof item === "string") {
        const url = normalizeExternalUrl(item);
        return url ? { name: url, url } : null;
      }

      const name = String(item?.name || "").trim();
      const url = normalizeExternalUrl(item?.url);

      if (!name || !url) {
        return null;
      }

      return { name, url };
    })
    .filter(Boolean);
}

function serializeDownloads(downloads) {
  if (!Array.isArray(downloads)) {
    return [];
  }

  return downloads
    .map((item) => {
      if (typeof item === "string") {
        const url = String(item || "").trim();
        return url ? { name: getDownloadLabel(url), url } : null;
      }

      const name = String(item?.name || "").trim();
      const url = String(item?.url || "").trim();

      if (!url) {
        return null;
      }

      return {
        name: name || getDownloadLabel(url),
        url,
      };
    })
    .filter(Boolean);
}

function getDownloadLabel(url) {
  try {
    const parsed = new URL(normalizeExternalUrl(url));
    const lastSegment = parsed.pathname.split("/").filter(Boolean).pop();
    return lastSegment || url;
  } catch (_error) {
    return url;
  }
}

function normalizeExternalUrl(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "";
  }

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../") ||
    normalized.startsWith("#") ||
    normalized.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(normalized)
  ) {
    return normalized;
  }

  return `https://${normalized}`;
}

function normalizeDetailSections(detailSections) {
  if (!Array.isArray(detailSections)) {
    return [];
  }

  return detailSections
    .map((section, index) => {
      const title = String(section?.title || "").trim();
      const contentType = section?.contentType === "points" ? "points" : "paragraph";
      const points = normalizeStringArray(section?.points);

      if (!title) {
        return null;
      }

      return {
        title,
        contentType,
        paragraph: contentType === "paragraph" ? String(section?.paragraph || "").trim() : "",
        points: contentType === "points" ? points : [],
        sortOrder: normalizeOptionalNumber(section?.sortOrder, index + 1),
      };
    })
    .filter(Boolean);
}

async function normalizeFeatureCardIds(featureCardIds) {
  const ids = Array.isArray(featureCardIds)
    ? [...new Set(featureCardIds.map((item) => String(item || "").trim()).filter(Boolean))]
    : [];

  if (!ids.length) {
    return [];
  }

  const cards = await FeatureCard.find({ _id: { $in: ids } }).select("_id").lean();
  return cards.map((card) => card._id);
}

async function normalizeHighlightCards(highlightCards) {
  if (!Array.isArray(highlightCards)) {
    return [];
  }

  const normalizedItems = highlightCards
    .map((item, index) => ({
      featureCardId: String(item?.featureCardId || "").trim(),
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
      sortOrder: normalizeOptionalNumber(item?.sortOrder, index + 1),
    }))
    .filter((item) => item.featureCardId && item.title);

  if (!normalizedItems.length) {
    return [];
  }

  const existingCards = await FeatureCard.find({
    _id: { $in: normalizedItems.map((item) => item.featureCardId) },
  })
    .select("_id")
    .lean();

  const validCardIdSet = new Set(existingCards.map((card) => String(card._id)));

  return normalizedItems
    .filter((item) => validCardIdSet.has(item.featureCardId))
    .map((item, index) => ({
      featureCardId: item.featureCardId,
      title: item.title,
      description: item.description,
      sortOrder: normalizeOptionalNumber(item.sortOrder, index + 1),
    }));
}

function serializeFeatureCards(featureCards) {
  if (!Array.isArray(featureCards)) {
    return [];
  }

  return featureCards.map((card) => ({
    _id: card._id,
    name: card.name || "",
    imageUrl: card.imageUrl || "",
    isActive: typeof card.isActive === "boolean" ? card.isActive : true,
    sortOrder: card.sortOrder || 0,
  }));
}

function serializeHighlightCards(highlightCards) {
  if (!Array.isArray(highlightCards)) {
    return [];
  }

  return highlightCards
    .map((item) => {
      const card = item?.featureCardId;

      if (!card?._id) {
        return null;
      }

      return {
        featureCardId: card._id,
        title: String(item?.title || "").trim(),
        description: String(item?.description || "").trim(),
        sortOrder: item?.sortOrder || 0,
        featureCard: {
          _id: card._id,
          name: card.name || "",
          imageUrl: card.imageUrl || "",
          isActive: typeof card.isActive === "boolean" ? card.isActive : true,
          sortOrder: card.sortOrder || 0,
        },
      };
    })
    .filter(Boolean);
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
  searchProducts,
  reorderProductRows,
  uploadProductImage,
  updateProduct,
  updateProductRow,
};
