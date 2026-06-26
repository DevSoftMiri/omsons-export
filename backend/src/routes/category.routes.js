const express = require("express");
const {
  createCategory,
  deleteCategory,
  getCatalogueCategories,
  getCategories,
  getCategoryBySlug,
  getCategoryForAdmin,
  reorderCategories,
  updateCategory,
  updateCategoryStatus,
} = require("../controllers/category.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getCategories);
router.get("/catalogue", getCatalogueCategories);
router.get("/manage/:id", requireAdmin, getCategoryForAdmin);
router.get("/:slug", getCategoryBySlug);

router.post("/", requireAdmin, createCategory);
router.patch("/reorder", requireAdmin, reorderCategories);
router.put("/:id", requireAdmin, updateCategory);
router.patch("/:id/status", requireAdmin, updateCategoryStatus);
router.delete("/:id", requireAdmin, deleteCategory);

module.exports = router;
