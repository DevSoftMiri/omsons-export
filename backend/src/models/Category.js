const mongoose = require("mongoose");

const categoryIconSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    bulletPoints: [{ type: String, trim: true }],
    imageUrl: { type: String, default: "", trim: true },
    icons: [categoryIconSchema],
    tableColumns: [{ type: String, required: true, trim: true }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
