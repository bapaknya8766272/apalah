import { verifyJWT, generateFingerprint } from '../utils/security.js';
import { Session, Admin } from '../models/index.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan.'
            });
        }
        
        const token = authHeader.substring(7);
        
        // Verify JWT
        const decoded = verifyJWT(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau sudah expired.'
            });
        }
        
        // Check session in database
        const session = await Session.findOne({ token, isValid: true });
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Sesi tidak valid.'
            });
        }
        
        // Check if session is expired
        if (session.isExpired()) {
            session.isValid = false;
            await session.save();
            return res.status(401).json({
                success: false,
                message: 'Sesi telah expired.'
            });
        }
        
        // Check IP restriction
        const currentIp = req.ip || req.connection.remoteAddress;
        if (session.ipAddress !== currentIp) {
            // Optional: Invalidate session on IP change for extra security
            // session.isValid = false;
            // await session.save();
            // return res.status(401).json({ success: false, message: 'IP address mismatch.' });
        }
        
        // Check fingerprint
        const currentFingerprint = generateFingerprint(req);
        if (session.fingerprint && session.fingerprint !== currentFingerprint) {
            session.isValid = false;
            await session.save();
            return res.status(401).json({
                success: false,
                message: 'Device mismatch detected.'
            });
        }
        
        // Update last activity
        await session.updateActivity();
        
        // Attach user info to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            sessionId: session._id
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada autentikasi.'
        });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Silakan login terlebih dahulu.'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak. Anda tidak memiliki izin.'
            });
        }
        
        next();
    };
};

// Optional authentication (for public routes that can benefit from user info)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        
        const token = authHeader.substring(7);
        const decoded = verifyJWT(token);
        
        if (decoded) {
            const session = await Session.findOne({ token, isValid: true });
            if (session && !session.isExpired()) {
                req.user = {
                    id: decoded.id,
                    username: decoded.username,
                    role: decoded.role
                };
            }
        }
        
        next();
    } catch {
        next();
    }
};
