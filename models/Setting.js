import mongoose from 'mongoose';
import CryptoJS from 'crypto-js';

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: 'general'
    },
    description: String,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt sensitive values
settingSchema.pre('save', function(next) {
    if (this.isEncrypted && this.isModified('value')) {
        const key = process.env.ENCRYPTION_KEY || 'default-key';
        this.value = CryptoJS.AES.encrypt(JSON.stringify(this.value), key).toString();
    }
    this.updatedAt = Date.now();
    next();
});

// Decrypt method
settingSchema.methods.getDecryptedValue = function() {
    if (this.isEncrypted) {
        const key = process.env.ENCRYPTION_KEY || 'default-key';
        const bytes = CryptoJS.AES.decrypt(this.value, key);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return this.value;
};

// Static get setting
settingSchema.statics.get = async function(key, defaultValue = null) {
    const setting = await this.findOne({ key });
    if (!setting) return defaultValue;
    return setting.isEncrypted ? setting.getDecryptedValue() : setting.value;
};

// Static set setting
settingSchema.statics.set = async function(key, value, isEncrypted = false, category = 'general') {
    return await this.findOneAndUpdate(
        { key },
        { key, value, isEncrypted, category },
        { upsert: true, new: true }
    );
};

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
