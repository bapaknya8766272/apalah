import express from 'express';
import { Testimonial } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter, customRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all testimonials (public)
router.get('/', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const testimonials = await Testimonial.getApproved(parseInt(limit));
        
        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        console.error('Get testimonials error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data testimoni.'
        });
    }
});

// Get all testimonials (admin - including unapproved)
router.get('/all',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const testimonials = await Testimonial.find()
                .sort({ createdAt: -1 })
                .lean();
            
            res.json({
                success: true,
                data: testimonials
            });
        } catch (error) {
            console.error('Get all testimonials error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get average rating (public)
router.get('/rating/average', async (req, res) => {
    try {
        const average = await Testimonial.getAverageRating();
        const count = await Testimonial.countDocuments({ isApproved: true });
        
        res.json({
            success: true,
            data: {
                average: parseFloat(average.toFixed(1)),
                count
            }
        });
    } catch (error) {
        console.error('Get average rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
});

// Create testimonial (public)
router.post('/',
    customRateLimit(3, 3600000), // 3 testimonials per hour per IP
    async (req, res) => {
        try {
            const { name, rating, message } = req.body;
            
            // Validate input
            if (!name || !rating || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama, rating, dan pesan harus diisi.'
                });
            }
            
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating harus antara 1-5.'
                });
            }
            
            if (message.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Pesan terlalu pendek (minimal 10 karakter).'
                });
            }
            
            const testimonial = await Testimonial.create({
                name: name.trim(),
                rating: parseInt(rating),
                message: message.trim(),
                ipAddress: req.ip || req.connection.remoteAddress,
                isApproved: true // Auto-approve for now
            });
            
            res.status(201).json({
                success: true,
                message: 'Testimoni berhasil ditambahkan.',
                data: testimonial
            });
        } catch (error) {
            console.error('Create testimonial error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menambahkan testimoni.'
            });
        }
    }
);

// Approve testimonial (admin only)
router.put('/:id/approve',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const testimonial = await Testimonial.findByIdAndUpdate(
                req.params.id,
                { isApproved: true },
                { new: true }
            );
            
            if (!testimonial) {
                return res.status(404).json({
                    success: false,
                    message: 'Testimoni tidak ditemukan.'
                });
            }
            
            res.json({
                success: true,
                message: 'Testimoni berhasil disetujui.',
                data: testimonial
            });
        } catch (error) {
            console.error('Approve testimonial error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Delete testimonial (admin only)
router.delete('/:id',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
            
            if (!testimonial) {
                return res.status(404).json({
                    success: false,
                    message: 'Testimoni tidak ditemukan.'
                });
            }
            
            res.json({
                success: true,
                message: 'Testimoni berhasil dihapus.'
            });
        } catch (error) {
            console.error('Delete testimonial error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

export default router;
