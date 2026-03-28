import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Generate secure random token
export const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Generate JWT tokens
export const generateJWT = (payload, type = 'access') => {
    const secret = type === 'refresh' 
        ? process.env.JWT_REFRESH_SECRET 
        : process.env.JWT_SECRET;
    
    const expiresIn = type === 'refresh' 
        ? process.env.JWT_REFRESH_EXPIRE || '7d'
        : process.env.JWT_EXPIRE || '1h';
    
    return jwt.sign(payload, secret, { expiresIn });
};

// Verify JWT token
export const verifyJWT = (token, type = 'access') => {
    const secret = type === 'refresh' 
        ? process.env.JWT_REFRESH_SECRET 
        : process.env.JWT_SECRET;
    
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

// Hash password
export const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate fingerprint from request
export const generateFingerprint = (req) => {
    const data = `${req.headers['user-agent'] || ''}-${req.ip}-${req.headers['accept-language'] || ''}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

// Encrypt data
export const encrypt = (data) => {
    const key = process.env.ENCRYPTION_KEY || 'default-key';
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// Decrypt data
export const decrypt = (encryptedData) => {
    try {
        const key = process.env.ENCRYPTION_KEY || 'default-key';
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
        return null;
    }
};

// Sanitize input
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 5000);
};

// Rate limiter memory store (for additional protection)
class MemoryRateLimiter {
    constructor() {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    check(identifier, maxRequests = 50, windowMs = 60000) {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const userRequests = this.requests.get(identifier);
        const validRequests = userRequests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
            return { allowed: false, remaining: 0 };
        }
        
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        
        return { 
            allowed: true, 
            remaining: maxRequests - validRequests.length 
        };
    }

    cleanup() {
        const now = Date.now();
        const windowStart = now - 60000;
        
        for (const [identifier, times] of this.requests.entries()) {
            const validTimes = times.filter(time => time > windowStart);
            if (validTimes.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, validTimes);
            }
        }
    }
}

export const memoryRateLimiter = new MemoryRateLimiter();

// SHA256 hash
export const sha256 = (message) => {
    return crypto.createHash('sha256').update(message).digest('hex');
};

// Verify admin credentials using env hashes
export const verifyAdminCredentials = async (username, password) => {
    const usernameHash = sha256(username);
    const passwordHash = sha256(password);
    
    const envUsernameHash = process.env.ADMIN_USERNAME_HASH;
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    return usernameHash === envUsernameHash && passwordHash === envPasswordHash;
};
