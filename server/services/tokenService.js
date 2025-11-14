import crypto from "crypto";
import { Buffer } from "buffer";
import { cookieOptions, env } from "../config/index.js";

const refreshTokens = new Map();

export const createAccessToken = (
  userId,
  expiresInSeconds = env.TOKEN_TTL_SECONDS
) => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Date.now() + expiresInSeconds * 1000 })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", env.APP_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
};

export const verifyAccessToken = (token) => {
  if (!token) return null;
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = crypto
    .createHmac("sha256", env.APP_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  const body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (Date.now() > body.exp) return null;
  return body;
};

export const createRefreshToken = (
  userId,
  ttlSeconds = env.REFRESH_TTL_SECONDS
) => {
  const token = crypto.randomBytes(40).toString("hex");
  const exp = Date.now() + ttlSeconds * 1000;
  refreshTokens.set(token, { userId, exp });
  return token;
};

export const verifyRefreshToken = (token) => {
  if (!token) return null;
  const record = refreshTokens.get(token);
  if (!record) return null;
  if (Date.now() > record.exp) {
    refreshTokens.delete(token);
    return null;
  }
  return record.userId;
};

export const clearRefreshToken = (token) => {
  if (token) refreshTokens.delete(token);
};

export const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    ...cookieOptions,
    maxAge: env.REFRESH_TTL_SECONDS * 1000,
  });
};

export const getCookie = (req, name) => {
  const cookies = req.headers?.cookie;
  if (!cookies) return null;
  const match = cookies
    .split(";")
    .map((part) => part.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};
