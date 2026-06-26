const Category = require("../models/Category");
const Product = require("../models/Product");

async function syncCategoryFromProductPayload(payload = {}) {
  const name = String(payload.mainCategory || payload.name || "").trim();
  const slug = String(payload.category || payload.slug || "").trim();

  if (!name || !slug) {
    return null;
  }

  const existing = await Category.findOne({ slug });

  if (!existing) {
    return Category.create({
      name,
      slug,
      mainCategory: name,
      submenuTitle: "",
      heroImage: "",
      description: "",
    });
  }

  const update = {};

  if (existing.name !== name) {
    update.name = name;
  }

  if (existing.mainCategory !== name) {
    update.mainCategory = name;
  }

  if (!Object.keys(update).length) {
    return existing;
  }

  return Category.findByIdAndUpdate(existing._id, update, { new: true });
}

async function syncCategoriesFromProducts() {
  const products = await Product.find({}, "mainCategory category").lean();
  let synced = 0;

  for (const product of products) {
    const category = await syncCategoryFromProductPayload(product);

    if (category) {
      synced += 1;
    }
  }

  return { synced, totalProducts: products.length };
}

module.exports = {
  syncCategoryFromProductPayload,
  syncCategoriesFromProducts,
};
