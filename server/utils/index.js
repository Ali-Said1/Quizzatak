import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Buffer } from "buffer";

export const randomId = () => crypto.randomUUID();
export const nowISO = () => new Date().toISOString();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

export const hashPassword = (password) =>
  bcrypt.hashSync(password, BCRYPT_ROUNDS);

const isBcryptHash = (hash = "") =>
  typeof hash === "string" &&
  hash.startsWith("$2") &&
  hash.split("$").length >= 4;

export const verifyPassword = (password, stored) => {
  if (!stored) return false;
  if (isBcryptHash(stored)) {
    try {
      return bcrypt.compareSync(password, stored);
    } catch {
      return false;
    }
  }
  const [salt, originalHash] = stored.split(":");
  if (!salt || !originalHash) return false;
  const comparison = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(originalHash, "hex"),
    Buffer.from(comparison, "hex")
  );
};

const toPlain = (doc) => {
  if (!doc) return null;
  if (typeof doc.toJSON === "function") {
    return doc.toJSON();
  }
  if (typeof doc.toObject === "function") {
    return doc.toObject();
  }
  return JSON.parse(JSON.stringify(doc));
};

export const sanitizeUser = (user) => {
  const plain = toPlain(user);
  if (!plain) return null;
  delete plain.passwordHash;
  plain.classrooms = (plain.classrooms || []).map(
    (id) => id?.toString?.() || id
  );
  plain.quizSubmissions = (plain.quizSubmissions || []).map(
    (id) => id?.toString?.() || id
  );
  return plain;
};

export const sanitizeDoc = (doc) => toPlain(doc);

export const generateJoinCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  while (code.length < 6) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

export const generateGamePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateShareCode = () => generateJoinCode();

export const ensureUnique = (generator, predicate) => {
  let value;
  do {
    value = generator();
  } while (predicate(value));
  return value;
};

export const ensureQuestionIds = (questions = []) =>
  questions.map((question) => ({
    id: question.id || randomId(),
    text: question.text,
    options: question.options || [],
    correct: Number.isInteger(question.correct) ? question.correct : 0,
    timer: Number(question.timer) || 10,
  }));
