const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { env } = require("../config/env");
const ApiError = require("../utils/ApiError");
const AdminUser = require("../models/AdminUser");
const { verifyPassword } = require("../utils/password");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const adminUser = await AdminUser.findOne({ email: normalizedEmail });

  if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  res.json({
    token: jwt.sign(
      { sub: adminUser._id.toString(), email: adminUser.email, role: adminUser.role },
      env.jwtSecret,
      { expiresIn: "1d" }
    ),
    user: {
      id: adminUser._id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    },
  });
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  const adminUser = await AdminUser.findById(req.user.sub).select("_id email name role");

  if (!adminUser) {
    throw new ApiError(401, "Admin session is no longer valid");
  }

  res.json({ user: adminUser });
});

module.exports = { login, getCurrentAdmin };
