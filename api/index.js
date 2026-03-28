import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import middleware
import {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    hppMiddleware,
    xssProtection,
    requestLogger,
    securityCheck
} from '../middleware/security.js';
import { apiLimiter } from '../middleware/rateLimit.js';

// Import routes
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import testimonialRoutes from './testimonials.js';
import settingRoutes from './settings.js';
import openaiRoutes from './openai.js';
import dashboardRoutes from './dashboard.js';

// Import models and default data
import { Product } from '../models/index.js';
import { defaultProducts } from '../utils/defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmetMiddleware);
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com', 'https://www.yourdomain.com'] 
        : '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);
app.use(xssProtection);
app.use(securityCheck);
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan.'
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validasi gagal.',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID tidak valid.'
        });
    }
    
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Data sudah ada.'
        });
    }
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Terjadi kesalahan server.' 
            : err.message
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are no longer needed in Mongoose 6+, but kept for clarity
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Initialize default products if none exist
        await Product.initializeDefaults(defaultProducts);
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});

export default app;
