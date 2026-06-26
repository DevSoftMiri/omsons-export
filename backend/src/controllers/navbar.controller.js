const asyncHandler = require("../utils/asyncHandler");
const Navbar = require("../models/Navbar");
const slugify = require("../utils/slugify");

const getNavbar = asyncHandler(async (_req, res) => {
  const navbars = await Navbar.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, navbars });
});

const createNavbarItem = asyncHandler(async (req, res) => {
  const payload = normalizeNavbarPayload(req.body);
  const navbar = await Navbar.create(payload);
  res.status(201).json({ success: true, navbar });
});

const updateNavbarItem = asyncHandler(async (req, res) => {
  const payload = normalizeNavbarPayload(req.body);
  const navbar = await Navbar.findByIdAndUpdate(req.params.id, payload, { new: true });

  if (!navbar) {
    return res.status(404).json({ success: false, message: "Navbar not found" });
  }

  res.json({ success: true, navbar });
});

const deleteNavbarItem = asyncHandler(async (req, res) => {
  const navbar = await Navbar.findByIdAndDelete(req.params.id);

  if (!navbar) {
    return res.status(404).json({ success: false, message: "Navbar not found" });
  }

  res.json({ success: true, message: "Navbar deleted" });
});

const importNavbarItems = asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body.navbars) ? req.body.navbars : [];
  const summary = {
    total: rows.length,
    created: 0,
    updated: 0,
  };

  for (const row of rows) {
    const payload = normalizeNavbarPayload(row);

    if (!payload.title || !payload.slug) {
      continue;
    }

    const existing = await Navbar.findOne({ slug: payload.slug }).select("_id");
    await Navbar.findOneAndUpdate({ slug: payload.slug }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    if (existing) {
      summary.updated += 1;
    } else {
      summary.created += 1;
    }
  }

  const navbars = await Navbar.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, summary, navbars });
});

function normalizeNavbarPayload(payload = {}) {
  return {
    title: String(payload.title || "").trim(),
    slug: String(payload.slug || payload.title || "").trim()
      ? slugify(payload.slug || payload.title)
      : "",
    order: Number(payload.order || 0),
    submenus: Array.isArray(payload.submenus)
      ? payload.submenus.map((submenu) => ({
          title: String(submenu.title || "").trim(),
          items: Array.isArray(submenu.items)
            ? submenu.items.map((item) => ({
                name: String(item.name || "").trim(),
                slug: String(item.slug || item.name || "").trim()
                  ? slugify(item.slug || item.name)
                  : "",
              }))
            : [],
        }))
      : [],
  };
}

module.exports = {
  getNavbar,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  importNavbarItems,
};
