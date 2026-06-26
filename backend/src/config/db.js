const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is missing. Skipping database connection.");
    return false;
  }

  const connection = await mongoose.connect(env.mongoUri);
  const { host, name } = connection.connection;

  console.log(`MongoDB connected: ${name} @ ${host}`);
  return true;
}

module.exports = connectDatabase;
