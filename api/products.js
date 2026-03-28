import express from 'express';
import { Product } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        
        const query = { isActive: true };
        if (category && category !== 'all') {
            query.category = category;
        }
        
        const products = await Product.find(query).sort({ category: 1, price: 1 }).lean();
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data produk.'
        });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id, isActive: true }).lean();
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data produk.'
        });
    }
});

// Create product (admin only)
router.post('/',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const { id, category, name, price, stock, desc, features, recommend } = req.body;
            
            // Validate required fields
            if (!id || !category || !name || !price || !desc) {
                return res.status(400).json({
                    success: false,
                    message: 'Semua field wajib diisi.'
                });
            }
            
            // Check if product ID already exists
            const existingProduct = await Product.findOne({ id });
            if (existingProduct) {
                return res.status(409).json({
                    success: false,
                    message: 'ID produk sudah digunakan.'
                });
            }
            
            const product = await Product.create({
                id,
                category,
                name,
                price,
                stock: stock || 0,
                desc,
                features: features || [],
                recommend: recommend || false
            });
            
            res.status(201).json({
                success: true,
                message: 'Produk berhasil ditambahkan.',
                data: product
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menambahkan produk.'
            });
        }
    }
);

// Update product (admin only)
router.put('/:id',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const { category, name, price, stock, desc, features, recommend, isActive } = req.body;
            
            const product = await Product.findOneAndUpdate(
                { id: req.params.id },
                {
                    category,
                    name,
                    price,
                    stock,
                    desc,
                    features,
                    recommend,
                    isActive,
                    updatedAt: Date.now()
                },
                { new: true }
            );
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produk tidak ditemukan.'
                });
            }
            
            res.json({
                success: true,
                message: 'Produk berhasil diperbarui.',
                data: product
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat memperbarui produk.'
            });
        }
    }
);

// Delete product (admin only)
router.delete('/:id',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const product = await Product.findOneAndDelete({ id: req.params.id });
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produk tidak ditemukan.'
                });
            }
            
            res.json({
                success: true,
                message: 'Produk berhasil dihapus.'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat menghapus produk.'
            });
        }
    }
);

// Restock product (admin only)
router.post('/:id/restock',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const { amount } = req.body;
            
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Jumlah restock tidak valid.'
                });
            }
            
            const product = await Product.findOne({ id: req.params.id });
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Produk tidak ditemukan.'
                });
            }
            
            product.stock += parseInt(amount);
            product.updatedAt = Date.now();
            await product.save();
            
            res.json({
                success: true,
                message: `Stok ${product.name} berhasil ditambahkan.`,
                data: {
                    name: product.name,
                    newStock: product.stock
                }
            });
        } catch (error) {
            console.error('Restock error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat restock.'
            });
        }
    }
);

// Update stock (for order processing)
router.post('/:id/update-stock', async (req, res) => {
    try {
        const { quantity, orderSecret } = req.body;
        
        // Simple secret validation for internal use
        if (orderSecret !== process.env.ORDER_SECRET) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak.'
            });
        }
        
        const product = await Product.findOne({ id: req.params.id });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan.'
            });
        }
        
        if (product.category !== 'other' && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Stok tidak mencukupi.'
            });
        }
        
        if (product.category !== 'other') {
            product.stock -= quantity;
            product.soldCount += quantity;
            product.updatedAt = Date.now();
            await product.save();
        }
        
        res.json({
            success: true,
            message: 'Stok berhasil diperbarui.',
            data: {
                remainingStock: product.stock
            }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupdate stok.'
        });
    }
});

// Reset products to default (admin only)
router.post('/reset',
    authenticate,
    authorize('superadmin'),
    adminLimiter,
    async (req, res) => {
        try {
            await Product.deleteMany({});
            
            // Default products will be initialized by the init function
            const { defaultProducts } = await import('../utils/defaultData.js');
            await Product.initializeDefaults(defaultProducts);
            
            res.json({
                success: true,
                message: 'Produk berhasil direset ke default.'
            });
        } catch (error) {
            console.error('Reset products error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat reset produk.'
            });
        }
    }
);

export default router;
