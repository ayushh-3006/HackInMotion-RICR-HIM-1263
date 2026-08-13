import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(uri as string);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
