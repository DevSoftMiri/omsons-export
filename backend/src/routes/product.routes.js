const express = require("express");
const multer = require("multer");
const {
  addProductRow,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductRow,
  getAdminProductList,
  getAllProducts,
  getProductForAdmin,
  getProductsByCategory,
  getProductBySlug,
  reorderProductRows,
  uploadProductImage,
  updateProductRow,
} = require("../controllers/product.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", getAllProducts);
router.get("/get-all", getAllProducts);
router.get("/admin/list", requireAdmin, getAdminProductList);
router.get("/manage/:id", requireAdmin, getProductForAdmin);
router.post(
  "/upload-image",
  requireAdmin,
  upload.single("image"),
  uploadProductImage
);
router.get("/category/:categorySlug", getProductsByCategory);
router.get("/get-by-category/:categorySlug", getProductsByCategory);
router.post("/:id/rows", requireAdmin, addProductRow);
router.put("/:id/rows/:rowId", requireAdmin, updateProductRow);
router.patch("/:id/rows/reorder", requireAdmin, reorderProductRows);
router.delete("/:id/rows/:rowId", requireAdmin, deleteProductRow);
router.get("/get-by-slug/:productSlug", getProductBySlug);
router.get("/:productSlug", getProductBySlug);
router.post("/", requireAdmin, createProduct);
router.post("/add", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.patch("/update/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);
router.delete("/delete/:id", requireAdmin, deleteProduct);

module.exports = router;
