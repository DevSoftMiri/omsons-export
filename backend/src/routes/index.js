const express = require("express");

const authRoutes = require("./auth.routes");
const navbarRoutes = require("./navbar.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const reviewRoutes = require("./review.routes");

const router = express.Router();

router.use("/admin", authRoutes);
router.use("/navbar", navbarRoutes);
router.use("/category", categoryRoutes);
router.use("/product", productRoutes);
router.use("/products", productRoutes);
router.use("/review", reviewRoutes);

module.exports = router;
