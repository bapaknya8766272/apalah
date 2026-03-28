import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: String,
    fingerprint: String,
    isValid: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Invalidate session
sessionSchema.methods.invalidate = async function() {
    this.isValid = false;
    return this.save();
};

// Update last activity
sessionSchema.methods.updateActivity = async function() {
    this.lastActivity = Date.now();
    return this.save();
};

// Check if session is expired
sessionSchema.methods.isExpired = function() {
    return this.expiresAt < Date.now() || !this.isValid;
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;
