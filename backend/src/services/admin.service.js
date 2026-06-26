const AdminUser = require("../models/AdminUser");
const { env } = require("../config/env");
const { hashPassword } = require("../utils/password");

async function ensureSeedAdmin() {
  const email = env.admin.email.toLowerCase();
  const existingAdmin = await AdminUser.findOne({ email });

  if (existingAdmin) {
    return existingAdmin;
  }

  return AdminUser.create({
    name: env.admin.name,
    email,
    passwordHash: hashPassword(env.admin.password),
    role: "admin",
  });
}

module.exports = {
  ensureSeedAdmin,
};
