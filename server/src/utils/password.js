import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HASH_VERSION = "scrypt-v1";
const SCRYPT_CONFIG = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024
};

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");

  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_CONFIG);

  return [
    HASH_VERSION,
    SCRYPT_CONFIG.N,
    SCRYPT_CONFIG.r,
    SCRYPT_CONFIG.p,
    salt.toString("hex"),
    derivedKey.toString("hex")
  ].join("$");;
}


export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split("$");

  if (parts.length !== 6) {
    return false;
  }

  const [version, nValue, rValue, pValue, saltHex, hashHex] = parts;

  if (version !== HASH_VERSION) {
    return false;
  }

  const N = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    !Number.isSafeInteger(N) ||
    N < 2 ||
    (N & (N - 1)) !== 0 ||
    !Number.isSafeInteger(r) ||
    r < 1 ||
    !Number.isSafeInteger(p) ||
    p < 1
  ) {
    return false;
  }

  if (
    !/^[a-f0-9]{32}$/.test(saltHex) ||
    !/^[a-f0-9]{128}$/.test(hashHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const originalHash = Buffer.from(hashHex, "hex");

  try {
    const derivedKey = await scryptAsync(
      password,
      salt,
      originalHash.length,
      {
        N,
        r,
        p,
        maxmem: SCRYPT_CONFIG.maxmem
      }
    );

    return timingSafeEqual(derivedKey, originalHash);
  } catch {
    return false;
  }
}
