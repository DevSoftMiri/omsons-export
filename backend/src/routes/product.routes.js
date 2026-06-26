const express = require("express");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductBySlug,
  importProductsFromJson,
} = require("../controllers/product.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/get-all", getAllProducts);
router.get("/category/:categorySlug", getProductsByCategory);
router.get("/get-by-category/:categorySlug", getProductsByCategory);
router.post("/import-json", requireAdmin, importProductsFromJson);
router.get("/get-by-slug/:productSlug", getProductBySlug);
router.get("/:productSlug", getProductBySlug);
router.post("/", requireAdmin, createProduct);
router.post("/add", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.patch("/update/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);
router.delete("/delete/:id", requireAdmin, deleteProduct);

module.exports = router;
