const crypto = require("crypto");

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash = "") {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const comparisonHash = hashPassword(password, salt).split(":")[1];
  const originalBuffer = Buffer.from(originalHash, "hex");
  const comparisonBuffer = Buffer.from(comparisonHash, "hex");

  if (originalBuffer.length !== comparisonBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, comparisonBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
