const express = require("express");
const {
  getNavbar,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  importNavbarItems,
} = require("../controllers/navbar.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", getNavbar);
router.post("/import", requireAdmin, importNavbarItems);
router.post("/", requireAdmin, createNavbarItem);
router.post("/add", requireAdmin, createNavbarItem);
router.put("/:id", requireAdmin, updateNavbarItem);
router.patch("/update/:id", requireAdmin, updateNavbarItem);
router.delete("/:id", requireAdmin, deleteNavbarItem);

module.exports = router;
