const connectDatabase = require("../config/db");
const { env } = require("../config/env");
const { ensureSeedAdmin } = require("../services/admin.service");

async function run() {
  await connectDatabase();
  const admin = await ensureSeedAdmin();

  console.log("Admin seed complete");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${env.admin.password}`);
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to seed admin", error);
  process.exit(1);
});
