require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const User = require('./models/User');
const Course = require('./models/Course');
const { runSeed } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

// Connect to Database and auto-seed if demo accounts or curriculum are missing
const startServer = async () => {
  await connectDB();

  // Auto-seed: verify that the default demo accounts and baseline curriculum exist
  try {
    const [adminUser, instructorUser, studentUser, courseCount] = await Promise.all([
      User.findOne({ email: 'admin@learnsphere.com' }),
      User.findOne({ email: 'instructor@learnsphere.com' }),
      User.findOne({ email: 'student@learnsphere.com' }),
      Course.countDocuments()
    ]);

    if (!adminUser || !instructorUser || !studentUser || courseCount === 0) {
      console.log('[LearnSphere Backend] Default demo accounts or courses missing — running database seed...');
      await runSeed();
      console.log('[LearnSphere Backend] Auto-seed completed. Demo accounts are ready.');
    } else {
      console.log(`[LearnSphere Backend] Verified demo accounts and ${courseCount} courses present.`);
    }
  } catch (seedError) {
    console.error('[LearnSphere Backend] Auto-seed check failed (non-fatal):', seedError.message);
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
