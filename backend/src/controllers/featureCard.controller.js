const asyncHandler = require("../utils/asyncHandler");
const FeatureCard = require("../models/FeatureCard");
const cloudinary = require("../config/cloudinary");

const getFeatureCards = asyncHandler(async (_req, res) => {
  const featureCards = await FeatureCard.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  res.json({ success: true, featureCards });
});

const getActiveFeatureCards = asyncHandler(async (_req, res) => {
  const featureCards = await FeatureCard.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  res.json({ success: true, featureCards });
});

const getFeatureCardForAdmin = asyncHandler(async (req, res) => {
  const featureCard = await FeatureCard.findById(req.params.id).lean();

  if (!featureCard) {
    return res.status(404).json({ success: false, message: "Feature card not found" });
  }

  res.json({ success: true, featureCard });
});

const uploadFeatureCardImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError("Feature card image is required");
  }

  const previousPublicId = String(req.body.previousPublicId || "").trim();
  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: "omsons/feature-cards",
    resource_type: "image",
  });

  if (previousPublicId && previousPublicId !== uploaded.public_id) {
    await destroyCloudinaryAsset(previousPublicId);
  }

  res.status(201).json({
    success: true,
    imageUrl: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });
});

const createFeatureCard = asyncHandler(async (req, res) => {
  const payload = normalizeFeatureCardPayload(req.body);
  const sortOrder = await getNextFeatureCardSortOrder();

  const featureCard = await FeatureCard.create({
    ...payload,
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, sortOrder),
  });

  res.status(201).json({ success: true, featureCard });
});

const updateFeatureCard = asyncHandler(async (req, res) => {
  const featureCard = await FeatureCard.findById(req.params.id);

  if (!featureCard) {
    return res.status(404).json({ success: false, message: "Feature card not found" });
  }

  featureCard.set({
    ...normalizeFeatureCardPayload(req.body),
    sortOrder: normalizeOptionalNumber(req.body.sortOrder, featureCard.sortOrder),
    isActive: typeof req.body.isActive === "boolean" ? req.body.isActive : featureCard.isActive,
  });

  await featureCard.save();
  res.json({ success: true, featureCard });
});

const deleteFeatureCard = asyncHandler(async (req, res) => {
  const featureCard = await FeatureCard.findByIdAndDelete(req.params.id);

  if (!featureCard) {
    return res.status(404).json({ success: false, message: "Feature card not found" });
  }

  res.json({ success: true, message: "Feature card deleted" });
});

function normalizeFeatureCardPayload(payload = {}) {
  const name = String(payload.name || "").trim();

  if (!name) {
    throw validationError("Feature card name is required");
  }

  return {
    name,
    imageUrl: String(payload.imageUrl || "").trim(),
    imagePublicId: String(payload.imagePublicId || "").trim(),
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
  };
}

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

async function destroyCloudinaryAsset(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (_error) {
    // Preserve the new asset even if cleanup fails.
  }
}

async function getNextFeatureCardSortOrder() {
  const lastCard = await FeatureCard.findOne().sort({ sortOrder: -1 }).lean();
  return (lastCard?.sortOrder || 0) + 1;
}

function normalizeOptionalNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

module.exports = {
  createFeatureCard,
  deleteFeatureCard,
  getActiveFeatureCards,
  getFeatureCardForAdmin,
  getFeatureCards,
  uploadFeatureCardImage,
  updateFeatureCard,
};
