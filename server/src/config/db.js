import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async (uriOverride = null) => {
  try {
    const mongoUri = uriOverride || process.env.MONGODB_URI || 'mongodb://localhost:27017/financial_tracker';
    
    // In dev mode, if instructed or if standard connection fails, allow memory server fallback for smooth local testing
    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = memoryServerInstance.getUri();
      console.log(`[Database] Using MongoMemoryServer for isolated local testing: ${inMemoryUri}`);
      const conn = await mongoose.connect(inMemoryUri);
      return conn;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] Connected to MongoDB: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    
    // If running in development and local MongoDB is unreachable, start memory server fallback so user doesn't get blocked
    if (process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI?.includes('mongodb+srv://')) {
      try {
        console.warn('[Database] Local MongoDB is not running on localhost:27017. Initializing embedded database fallback for smooth local experience...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const inMemoryUri = memoryServerInstance.getUri();
        console.log(`[Database] Embedded MongoDB initialized at: ${inMemoryUri}`);
        const conn = await mongoose.connect(inMemoryUri);
        return conn;
      } catch (fallbackError) {
        console.error(`[Database Error] Fallback failed: ${fallbackError.message}`);
        throw error;
      }
    }
    
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error('[Database Error] Disconnection error:', error);
  }
};
