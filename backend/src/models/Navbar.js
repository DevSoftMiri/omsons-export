const mongoose = require("mongoose");

const navbarItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const submenuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [navbarItemSchema],
  },
  { _id: false }
);

const navbarSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    submenus: [submenuSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Navbar || mongoose.model("Navbar", navbarSchema);
