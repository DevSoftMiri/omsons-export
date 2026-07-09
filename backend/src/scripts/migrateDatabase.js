const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const SOURCE_DB_NAME = process.env.SOURCE_MONGODB_DB || "test";

async function run() {
  const targetUri = process.env.MONGODB_URI;

  if (!targetUri) {
    throw new Error("MONGODB_URI is missing");
  }

  const sourceUri = replaceDatabaseName(targetUri, SOURCE_DB_NAME);
  const targetDbName = getDatabaseName(targetUri);

  if (!targetDbName) {
    throw new Error("Target database name is missing from MONGODB_URI");
  }

  if (SOURCE_DB_NAME === targetDbName) {
    throw new Error("Source and target databases are the same. Aborting migration.");
  }

  const sourceConnection = await mongoose.createConnection(sourceUri).asPromise();
  const targetConnection = await mongoose.createConnection(targetUri).asPromise();

  try {
    const sourceDb = sourceConnection.db;
    const targetDb = targetConnection.db;
    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

    if (!collections.length) {
      console.log(`No collections found in source database "${SOURCE_DB_NAME}".`);
      return;
    }

    for (const { name } of collections) {
      if (name.startsWith("system.")) {
        continue;
      }

      const sourceCollection = sourceDb.collection(name);
      const targetCollection = targetDb.collection(name);
      const documents = await sourceCollection.find({}).toArray();
      const indexes = await sourceCollection.indexes();

      await targetCollection.deleteMany({});

      if (documents.length) {
        await targetCollection.insertMany(documents, { ordered: true });
      }

      await syncIndexes(targetCollection, indexes);

      console.log(`Migrated ${documents.length} documents from ${SOURCE_DB_NAME}.${name} to ${targetDbName}.${name}`);
    }

    console.log(`Database migration complete: ${SOURCE_DB_NAME} -> ${targetDbName}`);
  } finally {
    await Promise.allSettled([sourceConnection.close(), targetConnection.close()]);
  }
}

function replaceDatabaseName(uri, databaseName) {
  const parsed = new URL(uri);
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
}

function getDatabaseName(uri) {
  const parsed = new URL(uri);
  return parsed.pathname.replace(/^\//, "").trim();
}

async function syncIndexes(collection, indexes) {
  for (const index of indexes) {
    if (index.name === "_id_") {
      continue;
    }

    await collection.createIndex(index.key, {
      name: index.name,
      unique: Boolean(index.unique),
      sparse: Boolean(index.sparse),
      background: false,
    });
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to migrate database", error);
    process.exit(1);
  });
