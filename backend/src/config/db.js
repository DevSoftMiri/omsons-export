const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is missing. Skipping database connection.");
    return false;
  }

  try {
    const connection = await mongoose.connect(env.mongoUri);
    const { host, name, readyState } = connection.connection;

    console.log(
      `MongoDB connected successfully. Database=${name}, Host=${host}, ReadyState=${readyState}`,
    );
    return true;
  } catch (error) {
    console.error("MongoDB connection failed.", error.message);
    throw error;
  }
}

module.exports = connectDatabase;
