import express from 'express';
import OpenAI from 'openai';
import { Setting } from '../models/index.js';
import { customRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Chat endpoint
router.post('/chat',
    customRateLimit(30, 60000), // 30 requests per minute
    async (req, res) => {
        try {
            const { message, model = 'gpt-3.5-turbo' } = req.body;
            
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Pesan tidak boleh kosong.'
                });
            }
            
            // Get API key from database
            const apiKey = await Setting.get('openai_apikey', '');
            
            if (!apiKey) {
                // Fallback response if no API key
                const fallbackResponse = getFallbackResponse(message);
                return res.json({
                    success: true,
                    data: { reply: fallbackResponse }
                });
            }
            
            // Initialize OpenAI
            const openai = new OpenAI({ apiKey });
            
            // System prompt
            const systemPrompt = `Kamu adalah AI Assistant untuk ALFA HOSTING, sebuah penyedia layanan hosting VPS, Panel Pterodactyl, dan Jasa IT di Indonesia.

Informasi layanan kami:
- VPS Cloud: Mulai dari Rp 15.000/bulan (1GB RAM) hingga Rp 120.000/bulan (32GB RAM Enterprise)
- Panel Pterodactyl: Mulai dari Rp 1.000/bulan (1GB) hingga Unlimited Rp 15.000/bulan
- Jasa IT: Install Panel, Script, Website, Bot WA, Optimasi VPS, dll

Kontak:
- WhatsApp: +62 822-2676-9163
- Email: sanzbot938@gmail.com

Jawablah dengan ramah, profesional, dan informatif. Gunakan bahasa Indonesia yang santai tapi tetap profesional.`;

            // Call OpenAI API
            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            });
            
            const reply = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.';
            
            res.json({
                success: true,
                data: { reply }
            });
            
        } catch (error) {
            console.error('OpenAI chat error:', error);
            
            // Fallback response on error
            const fallbackResponse = getFallbackResponse(req.body.message || '');
            
            res.json({
                success: true,
                data: { reply: fallbackResponse }
            });
        }
    }
);

// Fallback response function
function getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    const responses = {
        'harga': '💰 Harga kami sangat terjangkau:\n• VPS mulai Rp 15.000/bulan\n• Panel mulai Rp 1.000/bulan\n• Jasa IT mulai Rp 10.000',
        'cara beli': '🛒 Cara pembelian:\n1. Pilih layanan di website\n2. Klik "Tambah ke Keranjang"\n3. Lanjutkan ke pembayaran\n4. Bayar via QRIS/VA',
        'pembayaran': '💳 Kami menerima:\n• QRIS (semua e-wallet)\n• Virtual Account\n• Transfer Bank\nSemua via Pakasir',
        'panel': '🎮 Panel Pterodactyl:\n• 1GB: Rp 1.000\n• 4GB: Rp 4.000\n• Unlimited: Rp 15.000\n• Reseller: Rp 25.000',
        'vps': '🖥️ VPS Cloud:\n• 1GB: Rp 15.000\n• 4GB: Rp 35.000 (Best Seller)\n• 8GB: Rp 45.000\n• 16GB: Rp 70.000',
        'support': '📞 Hubungi kami:\n• WhatsApp: +62 822-2676-9163\n• Email: sanzbot938@gmail.com',
        'halo': '👋 Halo! Selamat datang di ALFA HOSTING. Ada yang bisa saya bantu?',
        'hai': '👋 Hai! Ada yang bisa saya bantu tentang layanan hosting kami?',
        'promo': '🎉 Promo aktif:\n• Diskon 20% kode: BESAR20\n• Berlaku untuk pembelian pertama'
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) return response;
    }
    
    return 'Maaf, saya belum mengerti pertanyaan tersebut. Silakan hubungi admin via WhatsApp: +62 822-2676-9163 📞';
}

export default router;
