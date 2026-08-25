// server/src/config/db.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log(`[DB] Successfully connected to MongoDB at ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[DB] Configured MongoDB URI connection failed: ${err.message}`);
      console.log(`[DB] Falling back to embedded in-memory MongoDB engine...`);
    }
  }

  try {
    // Spin up in-memory MongoDB for zero-configuration testing & public demos
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[DB] Connected to embedded in-memory MongoDB instance: ${uri}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Fatal Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] Database disconnected successfully.');
  } catch (error) {
    console.error('[DB] Error during disconnection:', error.message);
  }
};
