const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  syncCategoryCollection,
} = require("../controllers/category.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/sync-from-products", requireAdmin, syncCategoryCollection);
router.post("/", requireAdmin, createCategory);
router.post("/add", requireAdmin, createCategory);
router.put("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);

module.exports = router;
