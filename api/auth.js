import express from 'express';
import { 
    generateJWT, 
    generateFingerprint, 
    verifyAdminCredentials,
    sha256 
} from '../utils/security.js';
import { 
    Admin, 
    LoginAttempt, 
    Session 
} from '../models/index.js';
import { 
    loginLimiter, 
    checkIPLoginAttempts, 
    checkUserLoginAttempts 
} from '../middleware/rateLimit.js';

const router = express.Router();

// Login endpoint
router.post('/login', 
    loginLimiter,
    checkIPLoginAttempts,
    checkUserLoginAttempts,
    async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username dan password harus diisi.'
                });
            }
            
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const fingerprint = generateFingerprint(req);
            
            // Verify credentials using env hashes (super secure)
            const isValidCredentials = await verifyAdminCredentials(username, password);
            
            if (!isValidCredentials) {
                // Log failed attempt
                await LoginAttempt.create({
                    username: username.toLowerCase(),
                    ipAddress,
                    userAgent,
                    fingerprint,
                    success: false,
                    reason: 'Invalid credentials'
                });
                
                return res.status(401).json({
                    success: false,
                    message: 'Username atau password salah.'
                });
            }
            
            // Find or create admin in database
            let admin = await Admin.findOne({ username: username.toLowerCase() });
            
            if (!admin) {
                // Create admin record for tracking
                admin = await Admin.create({
                    username: username.toLowerCase(),
                    password: await hashPassword(password), // This won't be used, but needed for schema
                    role: 'superadmin'
                });
            }
            
            // Check if account is locked
            if (admin.isLocked()) {
                const remainingTime = Math.ceil((admin.lockoutUntil - Date.now()) / 60000);
                
                await LoginAttempt.create({
                    username: username.toLowerCase(),
                    ipAddress,
                    userAgent,
                    fingerprint,
                    success: false,
                    reason: 'Account locked'
                });
                
                return res.status(423).json({
                    success: false,
                    message: `Akun terkunci. Coba lagi dalam ${remainingTime} menit.`
                });
            }
            
            // Reset login attempts
            await admin.resetLoginAttempts();
            
            // Generate tokens
            const accessToken = generateJWT({
                id: admin._id,
                username: admin.username,
                role: admin.role
            }, 'access');
            
            const refreshToken = generateJWT({
                id: admin._id,
                type: 'refresh'
            }, 'refresh');
            
            // Create session in database
            const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 60;
            const session = await Session.create({
                token: accessToken,
                refreshToken,
                adminId: admin._id,
                username: admin.username,
                ipAddress,
                userAgent,
                fingerprint,
                expiresAt: new Date(Date.now() + sessionTimeout * 60 * 1000)
            });
            
            // Log successful login
            await LoginAttempt.create({
                username: username.toLowerCase(),
                ipAddress,
                userAgent,
                fingerprint,
                success: true
            });
            
            // Update admin last login
            admin.lastLogin = new Date();
            admin.lastLoginIp = ipAddress;
            await admin.save();
            
            res.json({
                success: true,
                message: 'Login berhasil.',
                data: {
                    token: accessToken,
                    refreshToken,
                    expiresIn: sessionTimeout * 60,
                    user: {
                        username: admin.username,
                        role: admin.role,
                        lastLogin: admin.lastLogin
                    }
                }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat login.'
            });
        }
    }
);

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token diperlukan.'
            });
        }
        
        // Verify refresh token
        const { verifyJWT } = await import('../utils/security.js');
        const decoded = verifyJWT(refreshToken, 'refresh');
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token tidak valid.'
            });
        }
        
        // Find session
        const session = await Session.findOne({ refreshToken, isValid: true });
        
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Sesi tidak ditemukan.'
            });
        }
        
        // Generate new access token
        const accessToken = generateJWT({
            id: session.adminId,
            username: session.username,
            role: 'admin'
        }, 'access');
        
        // Update session
        const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 60;
        session.token = accessToken;
        session.expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);
        await session.save();
        
        res.json({
            success: true,
            data: {
                token: accessToken,
                expiresIn: sessionTimeout * 60
            }
        });
        
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat refresh token.'
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            // Invalidate session
            await Session.findOneAndUpdate(
                { token },
                { isValid: false }
            );
        }
        
        res.json({
            success: true,
            message: 'Logout berhasil.'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat logout.'
        });
    }
});

// Check session endpoint
router.get('/check', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({
                success: true,
                data: { isAuthenticated: false }
            });
        }
        
        const token = authHeader.substring(7);
        const session = await Session.findOne({ token, isValid: true });
        
        if (!session || session.isExpired()) {
            return res.json({
                success: true,
                data: { isAuthenticated: false }
            });
        }
        
        res.json({
            success: true,
            data: {
                isAuthenticated: true,
                username: session.username,
                expiresIn: Math.floor((session.expiresAt - Date.now()) / 1000)
            }
        });
        
    } catch (error) {
        console.error('Check session error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memeriksa sesi.'
        });
    }
});

// Get login history
router.get('/history', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak.'
            });
        }
        
        const { verifyJWT } = await import('../utils/security.js');
        const token = authHeader.substring(7);
        const decoded = verifyJWT(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak valid.'
            });
        }
        
        const history = await LoginAttempt.find({
            username: decoded.username
        })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();
        
        res.json({
            success: true,
            data: history
        });
        
    } catch (error) {
        console.error('Get login history error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
});

export default router;
