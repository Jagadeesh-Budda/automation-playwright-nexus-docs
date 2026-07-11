require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const certifyRoutes = require('./src/routes/certify');
const verifyRoutes = require('./src/routes/verify');
const gradeRoutes = require('./src/routes/grade');
const validateCodeRoutes = require('./src/routes/validateCode');
const authRoutes = require('./src/routes/auth');
const progressRoutes = require('./src/routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Security Middleware
app.use(helmet());
app.use(limiter);
app.use(cors()); // Configure this to your frontend domain in production
app.use(express.json());

// Routes
app.use('/api', certifyRoutes);
app.use('/api', verifyRoutes);
app.use('/api', gradeRoutes);
app.use('/api', validateCodeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', progressRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'ASA Authority Engine is running.' });
});

// Start Server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 ASA Authority Backend running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
