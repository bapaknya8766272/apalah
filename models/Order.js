import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    category: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },
    customerInfo: {
        name: String,
        email: String,
        phone: String,
        whatsapp: String
    },
    paymentInfo: {
        method: String,
        transactionId: String,
        paidAt: Date
    },
    notes: {
        type: String,
        maxlength: 1000
    },
    ipAddress: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Get recent orders
orderSchema.statics.getRecent = async function(limit = 10) {
    return await this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
};

// Get sales data for chart
orderSchema.statics.getSalesData = async function(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orders = await this.find({
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'pending'] }
    }).lean();
    
    const data = {};
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        data[dateStr] = 0;
    }
    
    orders.forEach(order => {
        const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (data[dateStr] !== undefined) {
            data[dateStr] += order.total;
        }
    });
    
    return data;
};

// Get category sales data
orderSchema.statics.getCategoryData = async function() {
    const orders = await this.find({ status: 'completed' }).lean();
    
    const result = { vps: 0, panel: 0, other: 0 };
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (result[item.category] !== undefined) {
                result[item.category] += item.quantity;
            }
        });
    });
    
    return result;
};

// Get total revenue
orderSchema.statics.getTotalRevenue = async function() {
    const result = await this.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    return result[0]?.total || 0;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
