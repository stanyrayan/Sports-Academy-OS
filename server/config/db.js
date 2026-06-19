import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.log("MongoDB URI not provided. Using seeded in-memory demo store.");
    return false;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.");
  return true;
}
