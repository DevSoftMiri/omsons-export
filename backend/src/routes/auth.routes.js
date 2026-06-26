const express = require("express");
const { login, getCurrentAdmin } = require("../controllers/auth.controller");
const { getAdminStats } = require("../controllers/admin.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAdmin, getCurrentAdmin);
router.get("/stats", requireAdmin, getAdminStats);

module.exports = router;
