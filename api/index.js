import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import middleware keamanan
import {
    helmetMiddleware,
    mongoSanitizeMiddleware,
    hppMiddleware,
    xssProtection,
    requestLogger,
    securityCheck
} from '../middleware/security.js';
import { apiLimiter } from '../middleware/rateLimit.js';

// Import semua rute
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import testimonialRoutes from './testimonials.js';
import settingRoutes from './settings.js';
import openaiRoutes from './openai.js';
import dashboardRoutes from './dashboard.js';

// Import model dan data default
import { Product } from '../models/index.js';
import { defaultProducts } from '../utils/defaultData.js';

const app = express();

// ==========================================
// 1. KONFIGURASI DASAR & CORS
// ==========================================
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. MIDDLEWARE KEAMANAN
// ==========================================
try {
    app.use(helmetMiddleware);
    app.use(mongoSanitizeMiddleware);
    app.use(hppMiddleware);
    app.use(xssProtection);
    app.use(securityCheck);
    app.use(requestLogger);
    app.use('/api/', apiLimiter); 
} catch (error) {
    console.log("Info: Beberapa middleware keamanan dilewati sementara.");
}

// ==========================================
// 3. ROUTING API (WAJIB PAKAI AWALAN /api/)
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Endpoint tes untuk mengecek mesin menyala
app.get('/api', (req, res) => {
    res.status(200).json({ success: true, message: 'Mesin ALFA HOSTING API menyala bos!' });
});

// Penanganan Error Global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan internal server.' 
    });
});

// ==========================================
// 4. KONEKSI DATABASE & VERCEL EXPORT
// ==========================================
const connectDB = async () => {
    try {
        // Mencegah Vercel membuka koneksi berulang kali
        if (mongoose.connection.readyState >= 1) {
            return;
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected Boss!');
        
        // Masukkan data produk awal jika tabel produk masih kosong
        await Product.initializeDefaults(defaultProducts);
        
    } catch (error) {
        console.error('Gagal konek MongoDB:', error);
    }
};

// Jalankan fungsi koneksi database
connectDB();

// WAJIB EXPORT (JANGAN pakai app.listen karena Vercel pakai Serverless)
export default app;
