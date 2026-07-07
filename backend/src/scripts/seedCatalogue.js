const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductRow = require("../models/ProductRow");
const slugify = require("../utils/slugify");

const DEFAULT_JSON_PATH = path.resolve(
  __dirname,
  "../../../frontend/public/Omsons_Catalogue_v5_with_image_links.json"
);
const LOCAL_IMAGE_ROOT = path.resolve(
  __dirname,
  "../../../frontend/public/Export catalogue images"
);

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  const sourcePath = process.env.CATALOGUE_JSON_PATH
    ? path.resolve(process.cwd(), process.env.CATALOGUE_JSON_PATH)
    : DEFAULT_JSON_PATH;

  const catalogue = readCatalogue(sourcePath);
  const localImageIndex = buildLocalImageIndex(LOCAL_IMAGE_ROOT);

  await mongoose.connect(process.env.MONGODB_URI);

  await ProductRow.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});

  let productCount = 0;
  let rowCount = 0;
  const usedCategorySlugs = new Set();
  const usedProductSlugs = new Set();

  for (const [categoryIndex, categoryData] of catalogue.categories.entries()) {
    const categoryColumns = collectCategoryColumns(categoryData.products);
    const categorySlug = ensureUniqueSlug(
      cleanText(categoryData.categorySlug || categoryData.categoryId),
      usedCategorySlugs
    );
    const category = await Category.create({
      name: cleanText(categoryData.categoryName),
      slug: categorySlug,
      description: buildCategoryDescription(categoryData),
      bulletPoints: [],
      imageUrl: "",
      icons: [],
      tableColumns: categoryColumns,
      isActive: true,
      sortOrder: categoryIndex + 1,
    });

    for (const [productIndex, productData] of (categoryData.products || []).entries()) {
      const tableColumns = normalizeStringArray(productData.tableColumns);

      if (!tableColumns.length) {
        continue;
      }

      const matchedLocalImages = findLocalProductImages(productData, localImageIndex);
      const fallbackImages = normalizeRemoteImages(productData);
      const galleryImages = matchedLocalImages.length ? matchedLocalImages : fallbackImages;

      const product = await Product.create({
        categoryId: category._id,
        name: cleanText(productData.name),
        slug: ensureUniqueSlug(
          cleanText(productData.slug || productData.name),
          usedProductSlugs
        ),
        tableColumns,
        description: "",
        bulletPoints: normalizeStringArray(productData.points),
        imageUrl: galleryImages[0] || "",
        galleryImages,
        icons: [],
        technicalTags: [],
        isActive: true,
        sortOrder: productIndex + 1,
      });

      const rows = normalizeRows(productData.rows, tableColumns).map((row, rowIndex) => ({
        productId: product._id,
        values: row.values,
        sortOrder: normalizeOptionalNumber(row.sortOrder, rowIndex + 1),
        isActive: row.isActive !== false,
      }));

      if (rows.length) {
        await ProductRow.insertMany(rows);
      }

      productCount += 1;
      rowCount += rows.length;
    }
  }

  console.log(
    `Seeded ${catalogue.categories.length} categories, ${productCount} products, and ${rowCount} rows from ${path.basename(sourcePath)}.`
  );

  await mongoose.disconnect();
}

function readCatalogue(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Catalogue JSON not found at ${sourcePath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

  if (!Array.isArray(parsed.categories) || !parsed.categories.length) {
    throw new Error("Catalogue JSON does not contain any categories");
  }

  return parsed;
}

function collectCategoryColumns(products = []) {
  return [...new Set(products.flatMap((product) => normalizeStringArray(product.tableColumns)))];
}

function buildCategoryDescription(categoryData) {
  const parts = [
    cleanText(categoryData.categoryName),
    categoryData.pageRange ? `pages ${cleanText(categoryData.pageRange)}` : "",
    Number.isFinite(Number(categoryData.productCount)) ? `${Number(categoryData.productCount)} products` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function normalizeRows(rows, tableColumns) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row, index) => ({
    values: normalizeRowValues(row?.values, tableColumns),
    sortOrder: normalizeOptionalNumber(row?.sortOrder, index + 1),
    isActive: row?.isActive !== false,
  }));
}

function normalizeRowValues(values, tableColumns) {
  const source = values && typeof values === "object" ? values : {};

  return tableColumns.reduce((accumulator, column) => {
    accumulator[column] = cleanText(source[column] ?? "");
    return accumulator;
  }, {});
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => cleanText(item)).filter(Boolean))]
    : [];
}

function normalizeRemoteImages(productData = {}) {
  return [
    cleanText(productData.image),
    ...normalizeStringArray(productData.images),
  ].filter((value, index, source) => value && source.indexOf(value) === index);
}

function buildLocalImageIndex(rootDirectory) {
  if (!fs.existsSync(rootDirectory)) {
    return new Map();
  }

  const imageEntries = [];
  collectFiles(rootDirectory, imageEntries);

  const index = new Map();

  for (const absolutePath of imageEntries) {
    const parsed = path.parse(absolutePath);
    const normalizedKey = normalizeImageKey(parsed.name);

    if (!normalizedKey) {
      continue;
    }

    const relativePath = path.relative(rootDirectory, absolutePath);
    const publicUrl = buildPublicImageUrl(relativePath);
    const current = index.get(normalizedKey) || [];
    current.push(publicUrl);
    index.set(normalizedKey, current);
  }

  for (const [key, urls] of index.entries()) {
    index.set(key, [...new Set(urls)].sort());
  }

  return index;
}

function collectFiles(currentDirectory, fileAccumulator) {
  const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(absolutePath, fileAccumulator);
      continue;
    }

    if (entry.isFile()) {
      fileAccumulator.push(absolutePath);
    }
  }
}

function buildPublicImageUrl(relativePath) {
  const encodedPath = relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/Export%20catalogue%20images/${encodedPath}`;
}

function findLocalProductImages(productData = {}, localImageIndex = new Map()) {
  const matchedImages = [];
  const seen = new Set();

  for (const key of collectProductImageKeys(productData)) {
    const urls = localImageIndex.get(key) || [];

    for (const url of urls) {
      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      matchedImages.push(url);
    }
  }

  return matchedImages;
}

function collectProductImageKeys(productData = {}) {
  const keys = new Set();

  for (const row of productData.rows || []) {
    const rowValues = row?.values && typeof row.values === "object" ? row.values : {};

    for (const [column, value] of Object.entries(rowValues)) {
      if (!isCatalogueNumberColumn(column)) {
        continue;
      }

      for (const candidate of expandCatalogueNumberKeys(value)) {
        keys.add(candidate);
      }
    }
  }

  return [...keys];
}

function isCatalogueNumberColumn(columnName) {
  const normalized = String(columnName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return normalized === "catno";
}

function expandCatalogueNumberKeys(value) {
  const normalizedValue = normalizeImageKey(value);

  if (!normalizedValue) {
    return [];
  }

  const segments = normalizedValue.split(".");
  const keys = [normalizedValue];

  if (segments.length > 2) {
    keys.push(segments.slice(0, -1).join("."));
  }

  return [...new Set(keys)].filter(Boolean);
}

function normalizeImageKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|gif|avif)$/i, "")
    .replace(/[^a-z0-9.]/g, "");
}

function normalizeOptionalNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function ensureUniqueSlug(baseSlug, usedSlugs) {
  const normalizedBase = slugify(cleanText(baseSlug)) || "item";
  let candidate = normalizedBase;
  let suffix = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(candidate);
  return candidate;
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u00c2\u00b5/g, "µ")
    .replace(/\u00c2/g, "")
    .replace(/ï¬/g, "fi")
    .replace(/ï¬‚/g, "fl")
    .trim();
}

seed().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_error) {}
  process.exit(1);
});
