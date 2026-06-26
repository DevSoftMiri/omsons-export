const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const { stripHtml } = require("../utils/text");
const { syncCategoryFromProductPayload } = require("./categorySync.service");

async function importProducts(rawProducts = []) {
  if (!Array.isArray(rawProducts)) {
    throw new Error("Import payload must be an array of products");
  }

  const summary = {
    total: rawProducts.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };
  const errors = [];

  for (let index = 0; index < rawProducts.length; index += 1) {
    const rawProduct = rawProducts[index];

    try {
      const normalized = normalizeImportedProduct(rawProduct);

      if (!normalized.externalId && !normalized.slug) {
        summary.skipped += 1;
        errors.push({
          index,
          message: "Missing source id and slug",
        });
        continue;
      }

      const lookup = normalized.externalId
        ? { externalId: normalized.externalId }
        : { slug: normalized.slug };

      const existing = await Product.findOne(lookup).select("_id");
      const product = await Product.findOneAndUpdate(lookup, normalized, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      });
      await syncCategoryFromProductPayload(normalized);

      if (existing) {
        summary.updated += 1;
      } else if (product) {
        summary.created += 1;
      }
    } catch (error) {
      summary.errors += 1;
      errors.push({
        index,
        sourceId: rawProduct?.id || null,
        slug: rawProduct?.slug || null,
        message: error.message || "Import failed",
      });
    }
  }

  return { summary, errors };
}

function normalizeImportedProduct(rawProduct = {}) {
  const images = normalizeStringArray(rawProduct.images);
  const descriptionHtml = String(rawProduct.descriptionHtml || "").trim();
  const descriptionText = stripHtml(descriptionHtml);
  const features = normalizeStringArray(rawProduct.features);
  const categoryName = String(rawProduct.category || "").trim();

  return {
    externalId: normalizeOptionalString(rawProduct.id),
    sku: normalizeOptionalString(rawProduct.sku),
    name: normalizeRequiredString(rawProduct.name, "Product name is required"),
    slug: normalizeSlug(rawProduct.slug || rawProduct.name),
    mainCategory: categoryName,
    category: normalizeSlug(categoryName),
    categories: normalizeStringArray(rawProduct.categories),
    page: normalizeNumberOrNull(rawProduct.page),
    mainImage: images[0] || "",
    galleryImages: images,
    shortDescription: features[0] || descriptionText,
    description: descriptionText,
    descriptionHtml,
    features,
    specifications: [],
    options: [],
    priceList: [],
    accessories: [],
    spareParts: [],
    advantages: [],
    chartImages: [],
    videos: [],
    reviews: [],
    variants: Array.isArray(rawProduct.variants)
      ? rawProduct.variants.map(normalizeVariant)
      : [],
  };
}

function normalizeVariant(rawVariant = {}) {
  return {
    externalId: normalizeOptionalString(rawVariant.id),
    sku: normalizeOptionalString(rawVariant.sku),
    slug: normalizeSlug(rawVariant.slug || rawVariant.name || rawVariant.id || rawVariant.sku),
    name: normalizeOptionalString(rawVariant.name),
    specs: normalizeSpecMap(rawVariant.specs),
    specsText: normalizeOptionalString(rawVariant.specsText),
    pack: normalizeNumberOrUndefined(rawVariant.pack),
    price: normalizeNumberOrUndefined(rawVariant.price),
    priceLabel: normalizeOptionalString(rawVariant.priceLabel),
    inStock: Boolean(rawVariant.inStock),
    images: normalizeStringArray(rawVariant.images),
  };
}

function normalizeSpecMap(specs) {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(specs)
      .map(([key, value]) => [String(key).trim(), String(value ?? "").trim()])
      .filter(([key, value]) => key && value)
  );
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || "";
}

function normalizeRequiredString(value, errorMessage) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw new Error(errorMessage);
  }

  return normalized;
}

function normalizeSlug(value) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    return "";
  }

  return slugify(normalized);
}

function normalizeNumberOrUndefined(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : undefined;
}

function normalizeNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

module.exports = {
  importProducts,
  normalizeImportedProduct,
};
