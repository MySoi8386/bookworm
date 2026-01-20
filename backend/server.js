require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Quick SMTP config check (non-blocking)
    try {
      const { verifyEmailTransport } = require('./src/config/email.config');
      const emailCheck = await verifyEmailTransport();
      if (emailCheck?.ok) {
        console.log('✅ Email transport verified.');
      } else if (emailCheck?.reason === 'missing_env') {
        console.log('ℹ️  Email not configured (EMAIL_USER/EMAIL_PASS missing).');
      } else {
        console.warn('⚠️  Email transport verify failed:', emailCheck?.error || emailCheck);
      }
    } catch (e) {
      console.warn('⚠️  Email transport check error:', e?.message || e);
    }

    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      console.log('📦 Database models synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 Library Management System API`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
