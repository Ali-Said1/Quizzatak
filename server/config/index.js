import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const parseOrigins = (value) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const DEFAULT_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  TOKEN_TTL_SECONDS: Number(process.env.TOKEN_TTL_SECONDS || 60 * 60),
  REFRESH_TTL_SECONDS: Number(
    process.env.REFRESH_TTL_SECONDS || 60 * 60 * 24 * 7
  ),
  APP_SECRET: process.env.APP_SECRET || "quizzatak-secret",
  CLIENT_ORIGINS: parseOrigins(process.env.CLIENT_ORIGINS) || DEFAULT_ORIGINS,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/quizzatak",
};

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
};

export const createCorsOptions = () => ({
  origin(origin, callback) {
    if (
      !origin ||
      env.CLIENT_ORIGINS.includes(origin) ||
      env.NODE_ENV !== "production"
    ) {
      callback(null, origin || true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
