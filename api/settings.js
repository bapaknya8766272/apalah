import express from 'express';
import { Setting } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all settings (admin only)
router.get('/',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const settings = await Setting.find().lean();
            
            // Decrypt encrypted values
            const decryptedSettings = settings.map(s => ({
                key: s.key,
                value: s.isEncrypted ? s.getDecryptedValue() : s.value,
                category: s.category,
                isEncrypted: s.isEncrypted
            }));
            
            res.json({
                success: true,
                data: decryptedSettings
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get setting by key (admin only)
router.get('/:key',
    authenticate,
    authorize('superadmin', 'admin'),
    async (req, res) => {
        try {
            const setting = await Setting.findOne({ key: req.params.key });
            
            if (!setting) {
                return res.status(404).json({
                    success: false,
                    message: 'Pengaturan tidak ditemukan.'
                });
            }
            
            res.json({
                success: true,
                data: {
                    key: setting.key,
                    value: setting.isEncrypted ? setting.getDecryptedValue() : setting.value,
                    isEncrypted: setting.isEncrypted
                }
            });
        } catch (error) {
            console.error('Get setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Update setting (admin only)
router.put('/:key',
    authenticate,
    authorize('superadmin', 'admin'),
    adminLimiter,
    async (req, res) => {
        try {
            const { value, isEncrypted, category } = req.body;
            
            const setting = await Setting.set(
                req.params.key,
                value,
                isEncrypted,
                category || 'general'
            );
            
            res.json({
                success: true,
                message: 'Pengaturan berhasil disimpan.',
                data: {
                    key: setting.key,
                    isEncrypted: setting.isEncrypted
                }
            });
        } catch (error) {
            console.error('Update setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Delete setting (superadmin only)
router.delete('/:key',
    authenticate,
    authorize('superadmin'),
    adminLimiter,
    async (req, res) => {
        try {
            await Setting.findOneAndDelete({ key: req.params.key });
            
            res.json({
                success: true,
                message: 'Pengaturan berhasil dihapus.'
            });
        } catch (error) {
            console.error('Delete setting error:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan.'
            });
        }
    }
);

// Get Pakasir settings (public - only slug)
router.get('/public/pakasir', async (req, res) => {
    try {
        const slug = await Setting.get('pakasir_slug', 'alfahosting');
        
        res.json({
            success: true,
            data: { slug }
        });
    } catch (error) {
        console.error('Get pakasir settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan.'
        });
    }
});

export default router;
