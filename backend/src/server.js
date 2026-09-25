require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const User = require('./models/User');
const { runSeed } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

// Connect to Database and auto-seed if empty
const startServer = async () => {
  await connectDB();

  // Auto-seed: if the database has no users, populate demo data automatically
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[LearnSphere Backend] Empty database detected — running automatic seed...');
      await runSeed();
      console.log('[LearnSphere Backend] Auto-seed completed. Demo accounts are ready.');
    } else {
      console.log(`[LearnSphere Backend] Database already has ${userCount} users — skipping seed.`);
    }
  } catch (seedError) {
    console.error('[LearnSphere Backend] Auto-seed failed (non-fatal):', seedError.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[LearnSphere Backend] Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[LearnSphere Backend] API Health: http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err.message);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err.message);
    process.exit(1);
  });
};

startServer();
