import mongoose from "mongoose";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;

export const connectDB = async () => {
  // Fail fast instead of buffering indefinitely (prevents 10000ms timeouts)
  mongoose.set('bufferCommands', false);
  
  let retries = MAX_RETRIES;
  let delay = INITIAL_RETRY_DELAY;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MongoDB Connection Error: MONGODB_URI is not defined in environment variables.');
    return;
  }

  while (retries > 0) {
    try {
      if (mongoose.connection.readyState >= 1) {
        console.log('✅ MongoDB already connected.');
        return;
      }
      
      const conn = await mongoose.connect(uri as string, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 10
      });
      
      console.log(`✅ Connected to MongoDB successfully: ${conn.connection.host}`);
      return; // Exit retry loop on success
    } catch (error: any) {
      retries -= 1;
      console.error(`❌ MongoDB Connection Error (${MAX_RETRIES - retries}/${MAX_RETRIES}):`, error.message);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('💡 Tip: Ensure your local IP is whitelisted on MongoDB Atlas or local MongoDB service is running.');
      }

      if (retries === 0) {
        console.error('❌ Failed to connect to MongoDB after maximum retries.');
        // We do not process.exit() here to allow the server to boot, but DB operations will fail fast.
        break;
      }

      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};
