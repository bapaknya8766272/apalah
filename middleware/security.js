import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Helmet configuration for security headers
export const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// MongoDB sanitization middleware
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized key: ${key} from IP: ${req.ip}`);
    }
});

// HTTP Parameter Pollution protection
export const hppMiddleware = hpp({
    whitelist: [
        'category',
        'status',
        'page',
        'limit',
        'sort'
    ]
});

// Custom XSS protection
export const xssProtection = (req, res, next) => {
    // Sanitize request body
    if (req.body) {
        sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
        sanitizeObject(req.query);
    }
    
    next();
};

// Recursive function to sanitize object values
const sanitizeObject = (obj) => {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
};

// Sanitize string to prevent XSS
const sanitizeString = (str) => {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const method = req.method;
    const path = req.path;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log(`[${timestamp}] ${ip} - ${method} ${path} - ${userAgent}`);
    
    next();
};

// Security check middleware
export const securityCheck = (req, res, next) => {
    // Block requests with suspicious patterns
    const suspiciousPatterns = [
        /\.\./,  // Path traversal
        /<script/i,  // Script tags
        /javascript:/i,  // JavaScript protocol
        /on\w+=/i,  // Event handlers
    ];
    
    const checkString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.path;
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            console.warn(`Suspicious request blocked from IP: ${req.ip}`);
            return res.status(403).json({
                success: false,
                message: 'Permintaan ditolak karena mengandung pola mencurigakan.'
            });
        }
    }
    
    next();
};
