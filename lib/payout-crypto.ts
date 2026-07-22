import crypto from "crypto";
import { env } from "./env";

// Encrypts/decrypts sensitive payout numbers (mobile wallet or bank card)
// using AES-256-GCM. The key comes from PAYOUT_ENCRYPTION_KEY, which lives
// only in environment variables — never in the database. So a leaked
// database backup alone is not enough to read anyone's real number.
//
// Output format: "iv:authTag:ciphertext", all hex-encoded, joined with ":".
// GCM's authTag lets decryption detect if the ciphertext was tampered with.

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  return Buffer.from(env.PAYOUT_ENCRYPTION_KEY, "hex");
}

export function encryptPayoutNumber(plainNumber: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV, standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainNumber, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptPayoutNumber(encryptedValue: string): string {
  const [ivHex, authTagHex, dataHex] = encryptedValue.split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Malformed encrypted payout value");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// Returns the last 4 characters, safe to store/display unencrypted
// (e.g. "Mobile wallet ending in 5678"). Never store more than this
// in plain text.
export function getLast4(plainNumber: string): string {
  return plainNumber.slice(-4);
}