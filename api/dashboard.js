import express from 'express';
import { Product, Order, Testimonial } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/stats',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            // Get products stats
            const totalProducts = await Product.countDocuments({ isActive: true });
            const lowStockProducts = await Product.countDocuments({
                isActive: true,
                category: { $ne: 'other' },
                $expr: { $lte: ['$stock', 5] }
            });
            
            // Get orders stats
            const totalOrders = await Order.countDocuments();
            const totalRevenue = await Order.getTotalRevenue();
            const pendingOrders = await Order.countDocuments({ status: 'pending' });
            const completedOrders = await Order.countDocuments({ status: 'completed' });
            
            // Get testimonials stats
            const totalTestimonials = await Testimonial.countDocuments({ isApproved: true });
            const averageRating = await Testimonial.getAverageRating();
            
            // Get recent sales data (last 7 days)
            const salesData = await Order.getSalesData(7);
            
            // Get category data
            const categoryData = await Order.getCategoryData();
            
            res.json({
                success: true,
                data: {
                    products: {
                        total: totalProducts,
                        lowStock: lowStockProducts
                    },
                    orders: {
                        total: totalOrders,
                        pending: pendingOrders,
                        completed: completedOrders,
                        totalRevenue
                    },
                    testimonials: {
                        total: totalTestimonials,
                        averageRating: parseFloat(averageRating.toFixed(1))
                    },
                    salesData,
                    categoryData
                }
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil statistik.'
            });
        }
    }
);

// Get recent activity (admin only)
router.get('/activity',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            
            // Get recent orders
            const recentOrders = await Order.find()
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .lean();
            
            // Get recent testimonials
            const recentTestimonials = await Testimonial.find()
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .lean();
            
            // Combine and sort by date
            const activity = [
                ...recentOrders.map(o => ({
                    type: 'order',
                    description: `Pesanan ${o.orderId} - ${o.status}`,
                    amount: o.total,
                    date: o.createdAt
                })),
                ...recentTestimonials.map(t => ({
                    type: 'testimonial',
                    description: `Testimoni dari ${t.name}`,
                    rating: t.rating,
                    date: t.createdAt
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date))
             .slice(0, parseInt(limit));
            
            res.json({
                success: true,
                data: activity
            });
        } catch (error) {
            console.error('Get activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get low stock products (admin only)
router.get('/low-stock',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const products = await Product.find({
                isActive: true,
                category: { $ne: 'other' },
                $expr: { $lte: ['$stock', 5] }
            }).sort({ stock: 1 }).lean();
            
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Get low stock error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

export default router;
