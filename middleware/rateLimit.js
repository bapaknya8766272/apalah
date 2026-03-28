import rateLimit from 'express-rate-limit';
import { memoryRateLimiter } from '../utils/security.js';
import { LoginAttempt } from '../models/index.js';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip
});

// Strict rate limiter for login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip
});

// Rate limiter for admin operations
export const adminLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50,
    message: {
        success: false,
        message: 'Terlalu banyak permintaan admin. Silakan coba lagi nanti.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip
});

// Custom rate limiter middleware for specific routes
export const customRateLimit = (maxRequests = 10, windowMs = 60000) => {
    return async (req, res, next) => {
        const identifier = `${req.ip}-${req.path}`;
        const result = memoryRateLimiter.check(identifier, maxRequests, windowMs);
        
        if (!result.allowed) {
            return res.status(429).json({
                success: false,
                message: 'Terlalu banyak permintaan. Silakan tunggu sebentar.'
            });
        }
        
        next();
    };
};

// Check IP-based login attempts from database
export const checkIPLoginAttempts = async (req, res, next) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const failedAttempts = await LoginAttempt.getRecentFailedFromIP(ipAddress, 15);
        
        if (failedAttempts >= 10) {
            return res.status(429).json({
                success: false,
                message: 'IP Anda telah diblokir sementara karena terlalu banyak percobaan login gagal.'
            });
        }
        
        next();
    } catch (error) {
        console.error('Check IP login attempts error:', error);
        next();
    }
};

// Check user-based login attempts
export const checkUserLoginAttempts = async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) return next();
        
        const failedAttempts = await LoginAttempt.getRecentFailedForUser(username, 15);
        
        if (failedAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Akun ini telah diblokir sementara karena terlalu banyak percobaan login gagal.'
            });
        }
        
        next();
    } catch (error) {
        console.error('Check user login attempts error:', error);
        next();
    }
};
