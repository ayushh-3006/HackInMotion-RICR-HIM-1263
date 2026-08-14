import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to DB");
    const db = mongoose.connection.db;
    if (db) {
      await db
        .collection("interviewsessions")
        .dropIndex("shareToken_1")
        .catch((e) =>
          console.log("Index not found or already dropped", e.message),
        );
      console.log(
        "Index shareToken_1 dropped successfully (or did not exist). Restart your backend server so Mongoose can recreate it as sparse.",
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixIndex();
