import express from 'express';
import { Order, Product } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter, customRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Generate order ID
const generateOrderId = () => {
    const prefix = 'ALFA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Get all orders (admin only)
router.get('/',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const { status, limit = 50, page = 1 } = req.query;
            
            const query = {};
            if (status && status !== 'all') {
                query.status = status;
            }
            
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
            
            const total = await Order.countDocuments(query);
            
            res.json({
                success: true,
                data: orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Get orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data pesanan.'
            });
        }
    }
);

// Get recent orders (admin only)
router.get('/recent',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            
            const orders = await Order.getRecent(parseInt(limit));
            
            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error('Get recent orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get sales data for charts (admin only)
router.get('/sales-data',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const { days = 7 } = req.query;
            
            const salesData = await Order.getSalesData(parseInt(days));
            const categoryData = await Order.getCategoryData();
            const totalRevenue = await Order.getTotalRevenue();
            
            res.json({
                success: true,
                data: {
                    sales: salesData,
                    categories: categoryData,
                    totalRevenue
                }
            });
        } catch (error) {
            console.error('Get sales data error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get single order
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId }).lean();
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan.'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
});

// Create new order (public)
router.post('/',
    customRateLimit(10, 60000), // 10 requests per minute
    async (req, res) => {
        try {
            const { items, total, customerInfo, paymentInfo } = req.body;
            
            // Validate items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Item pesanan tidak valid.'
                });
            }
            
            // Validate stock for each item
            for (const item of items) {
                const product = await Product.findOne({ id: item.id });
                
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `Produk ${item.name} tidak ditemukan.`
                    });
                }
                
                if (product.category !== 'other' && product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Stok ${product.name} tidak mencukupi. Tersisa: ${product.stock}`
                    });
                }
            }
            
            // Reduce stock
            for (const item of items) {
                const product = await Product.findOne({ id: item.id });
                if (product && product.category !== 'other') {
                    product.stock -= item.quantity;
                    product.soldCount += item.quantity;
                    await product.save();
                }
            }
            
            const orderId = generateOrderId();
            
            const order = await Order.create({
                orderId,
                items,
                total,
                customerInfo,
                paymentInfo,
                status: 'pending',
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            });
            
            res.status(201).json({
                success: true,
                message: 'Pesanan berhasil dibuat.',
                data: {
                    orderId: order.orderId,
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt
                }
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat membuat pesanan.'
            });
        }
    }
);

// Update order status (admin only)
router.put('/:orderId/status',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const { status, notes } = req.body;
            
            if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status tidak valid.'
                });
            }
            
            const order = await Order.findOneAndUpdate(
                { orderId: req.params.orderId },
                {
                    status,
                    notes,
                    updatedAt: Date.now()
                },
                { new: true }
            );
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Pesanan tidak ditemukan.'
                });
            }
            
            // If cancelled or refunded, restore stock
            if (status === 'cancelled' || status === 'refunded') {
                for (const item of order.items) {
                    const product = await Product.findOne({ id: item.productId });
                    if (product && product.category !== 'other') {
                        product.stock += item.quantity;
                        product.soldCount -= item.quantity;
                        await product.save();
                    }
                }
            }
            
            res.json({
                success: true,
                message: 'Status pesanan berhasil diperbarui.',
                data: order
            });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Delete order (admin only)
router.delete('/:orderId',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Pesanan tidak ditemukan.'
                });
            }
            
            // Restore stock if order was pending
            if (order.status === 'pending') {
                for (const item of order.items) {
                    const product = await Product.findOne({ id: item.productId });
                    if (product && product.category !== 'other') {
                        product.stock += item.quantity;
                        product.soldCount -= item.quantity;
                        await product.save();
                    }
                }
            }
            
            res.json({
                success: true,
                message: 'Pesanan berhasil dihapus.'
            });
        } catch (error) {
            console.error('Delete order error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Clear all orders (admin only - superadmin)
router.delete('/',
    authenticate,
    authorize('superadmin'),
    adminLimiter,
    async (req, res) => {
        try {
            await Order.deleteMany({});
            
            res.json({
                success: true,
                message: 'Semua pesanan berhasil dihapus.'
            });
        } catch (error) {
            console.error('Clear orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

export default router;
