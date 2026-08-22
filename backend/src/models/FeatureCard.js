const mongoose = require("mongoose");

const featureCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "", trim: true },
    imagePublicId: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.FeatureCard || mongoose.model("FeatureCard", featureCardSchema);
