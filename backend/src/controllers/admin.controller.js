const asyncHandler = require("../utils/asyncHandler");
const Navbar = require("../models/Navbar");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");

const getAdminStats = asyncHandler(async (_req, res) => {
  const [navbarCount, categoryCount, productCount, reviewDocCount, embeddedReviewCounts] =
    await Promise.all([
      Navbar.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments(),
      Review.countDocuments(),
      Product.aggregate([
        {
          $project: {
            reviewCount: { $size: { $ifNull: ["$reviews", []] } },
          },
        },
      ]),
    ]);

  const embeddedReviewCount = embeddedReviewCounts.reduce(
    (total, entry) => total + (entry.reviewCount || 0),
    0
  );

  res.json({
    success: true,
    stats: {
      navbarCount,
      categoryCount,
      productCount,
      reviewCount: reviewDocCount + embeddedReviewCount,
    },
  });
});

module.exports = {
  getAdminStats,
};
