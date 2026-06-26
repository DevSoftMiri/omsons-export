const asyncHandler = require("../utils/asyncHandler");

const createReview = asyncHandler(async (req, res) => {
  res.status(201).json({ message: "Review scaffold ready", payload: req.body });
});

module.exports = { createReview };
