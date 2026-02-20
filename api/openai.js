import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Aktifkan CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Ambil API Key Gemini dari Environment Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Gemini API Key not configured',
            reply: 'Maaf, layanan AI sedang tidak tersedia. Silakan hubungi admin via WhatsApp.'
        });
    }

    try {
        // Inisialisasi Google Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Menggunakan model Gemini 1.5 Flash Latest (Paling stabil & Gratis)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            systemInstruction: `Kamu adalah Customer Service AI untuk ALFA Hosting, sebuah penyedia layanan hosting VPS, Panel Pterodactyl, dan Jasa IT.

Informasi perusahaan:
- Nama: ALFA Hosting
- WhatsApp: +62 822-2676-9163
- Email: sanzbot938@gmail.com

Layanan yang tersedia:
1. VPS Cloud (mulai Rp 15.000/bulan)
   - VPS 1GB: Rp 15.000
   - VPS 4GB: Rp 35.000 (Best Seller)
   - VPS 8GB: Rp 45.000

2. Panel Pterodactyl (mulai Rp 1.000/bulan)
   - Panel 1GB: Rp 1.000
   - Panel 4GB: Rp 4.000
   - Panel Unlimited: Rp 10.000

3. Jasa IT
   - Install Panel: Rp 10.000
   - Buat Website: Rp 50.000
   - Fix Script: Rp 7.000

Jawab dengan:
- Ramah, santai, namun profesional
- Singkat dan padat
- Gunakan bahasa Indonesia
- Jika tidak tahu atau pertanyaan di luar konteks hosting, arahkan untuk menghubungi WhatsApp admin.`
        });

        // Generate balasan dari Gemini
        const result = await model.generateContent(message);
        const reply = result.response.text();

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Gemini Error:', error);
        
        // Mode Fallback Offline (Cadangan jika API Error)
        const fallbackResponses = {
            'harga': 'Kami menyediakan berbagai layanan dengan harga terjangkau:\n• VPS mulai dari Rp 15.000/bulan\n• Panel mulai dari Rp 1.000/bulan\n• Jasa IT tergantung kebutuhan',
            'cara beli': 'Cara pembelian:\n1. Pilih layanan yang diinginkan\n2. Klik "Tambah ke Keranjang"\n3. Lanjutkan ke pembayaran\n4. Selesaikan pembayaran via Pakasir',
            'panel': 'Panel Pterodactyl kami:\n• Panel 1GB: Rp 1.000\n• Panel 4GB: Rp 4.000\n• Panel Unlimited: Rp 15.000',
            'vps': 'VPS Cloud kami:\n• VPS 1GB: Rp 15.000\n• VPS 4GB: Rp 35.000 (Best Seller)\n• VPS 8GB: Rp 45.000',
        };

        const lowerMessage = message.toLowerCase();
        for (const [key, responseText] of Object.entries(fallbackResponses)) {
            if (lowerMessage.includes(key)) {
                return res.status(200).json({ reply: responseText });
            }
        }

        return res.status(200).json({
            reply: 'Maaf, sistem AI sedang sibuk. Silakan hubungi admin via WhatsApp: +62 822-2676-9163'
        });
    }
}
