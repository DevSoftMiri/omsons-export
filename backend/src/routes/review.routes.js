const express = require("express");
const { createReview } = require("../controllers/review.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/add", requireAdmin, createReview);

module.exports = router;
