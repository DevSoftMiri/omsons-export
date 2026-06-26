const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  admin: {
    name: process.env.ADMIN_NAME || "OMSONS Admin",
    email: process.env.ADMIN_EMAIL || "admin@omsons.com",
    password: process.env.ADMIN_PASSWORD || "Admin@123",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

module.exports = { env };
