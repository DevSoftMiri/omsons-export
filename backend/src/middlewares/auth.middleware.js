const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing admin token" });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid admin token" });
  }
}

module.exports = { requireAdmin };
