import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB Connection Closed');
  } catch (error) {
    console.error(`❌ Error closing MongoDB connection: ${(error as Error).message}`);
  }
};
