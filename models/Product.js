import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['vps', 'panel', 'other'],
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    desc: {
        type: String,
        required: true,
        maxlength: 2000
    },
    features: {
        type: [String],
        default: []
    },
    recommend: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    soldCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to initialize default products
productSchema.statics.initializeDefaults = async function(defaultProducts) {
    const count = await this.countDocuments();
    if (count === 0) {
        await this.insertMany(defaultProducts);
        console.log('Default products initialized');
    }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
