import mongoose from "mongoose";
import { env } from "./index.js";

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.info(`MongoDB connected at ${env.MONGO_URI}`);
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDatabase;
