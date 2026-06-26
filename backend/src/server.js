const app = require("./app");
const connectDatabase = require("./config/db");
const { env } = require("./config/env");
const { ensureSeedAdmin } = require("./services/admin.service");

async function startServer() {
  const isConnected = await connectDatabase();

  if (isConnected) {
    await ensureSeedAdmin();
  }

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
