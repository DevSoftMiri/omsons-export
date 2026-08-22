const express = require("express");
const multer = require("multer");

const {
  createFeatureCard,
  deleteFeatureCard,
  getActiveFeatureCards,
  getFeatureCardForAdmin,
  getFeatureCards,
  uploadFeatureCardImage,
  updateFeatureCard,
} = require("../controllers/featureCard.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", getActiveFeatureCards);
router.get("/admin/list", requireAdmin, getFeatureCards);
router.get("/manage/:id", requireAdmin, getFeatureCardForAdmin);
router.post("/upload-image", requireAdmin, upload.single("image"), uploadFeatureCardImage);
router.post("/", requireAdmin, createFeatureCard);
router.put("/:id", requireAdmin, updateFeatureCard);
router.delete("/:id", requireAdmin, deleteFeatureCard);

module.exports = router;
