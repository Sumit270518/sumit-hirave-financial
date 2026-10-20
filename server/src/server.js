import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Essential for cloud deployment (e.g., Render)

let serverInstance = null;

const startServer = async () => {
  try {
    await connectDB();
    serverInstance = app.listen(PORT, HOST, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Financial Habit & Wealth Growth API Server running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/v1/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle termination signals gracefully
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
