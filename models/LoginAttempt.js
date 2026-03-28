import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true,
        index: true
    },
    userAgent: String,
    fingerprint: String,
    success: {
        type: Boolean,
        required: true
    },
    reason: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
});

// Auto delete old records
loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Get recent failed attempts from IP
loginAttemptSchema.statics.getRecentFailedFromIP = async function(ipAddress, minutes = 15) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return await this.countDocuments({
        ipAddress,
        success: false,
        timestamp: { $gte: since }
    });
};

// Get recent failed attempts for username
loginAttemptSchema.statics.getRecentFailedForUser = async function(username, minutes = 15) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return await this.countDocuments({
        username: username.toLowerCase(),
        success: false,
        timestamp: { $gte: since }
    });
};

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
export default LoginAttempt;
