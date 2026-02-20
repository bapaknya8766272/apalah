import OpenAI from "openai";

export default async function handler(req, res) {
    // Aktifkan CORS agar website bisa memanggil API ini
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

    // Tangkap "message" dan "model" yang dikirim dari skrip website
    const { message, model } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Ambil API Key dari Environment Variable (Vercel)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'OpenAI API Key not configured',
            reply: 'Maaf, layanan AI sedang tidak tersedia. Silakan hubungi admin via WhatsApp.'
        });
    }

    // Inisialisasi client OpenAI
    const client = new OpenAI({ apiKey: apiKey });

    try {
        // Gunakan model yang dikirim dari website (hasil pilihan admin), 
        // jika kosong, fallback ke gpt-3.5-turbo
        const selectedModel = model || process.env.OPENAI_MODEL || "gpt-3.5-turbo";

        // Request ke OpenAI menggunakan format Chat Completions standar
        const response = await client.chat.completions.create({
            model: selectedModel,
            messages: [
                {
                    role: 'system',
                    content: `Kamu adalah Customer Service AI untuk ALFA Hosting, sebuah penyedia layanan hosting VPS, Panel Pterodactyl, dan Jasa IT.

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
- Ramah dan profesional
- Singkat dan jelas
- Bahasa Indonesia yang baik
- Jika tidak tahu, arahkan ke WhatsApp admin`
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const reply = response.choices[0]?.message?.content || 'Maaf, saya tidak mengerti.';
        return res.status(200).json({ reply });

    } catch (error) {
        console.error('OpenAI Error:', error);
        
        // Jawaban cadangan jika kuota API habis atau gagal terhubung
        const fallbackResponses = {
            'harga': 'Kami menyediakan berbagai layanan dengan harga terjangkau:\n• VPS mulai dari Rp 15.000/bulan\n• Panel mulai dari Rp 1.000/bulan\n• Jasa IT tergantung kebutuhan',
            'cara beli': 'Cara pembelian:\n1. Pilih layanan yang diinginkan\n2. Klik "Tambah ke Keranjang"\n3. Lanjutkan ke pembayaran\n4. Selesaikan pembayaran via Pakasir',
            'panel': 'Panel Pterodactyl kami:\n• Panel 1GB: Rp 1.000\n• Panel 4GB: Rp 4.000\n• Panel Unlimited: Rp 15.000',
            'vps': 'VPS Cloud kami:\n• VPS 1GB: Rp 15.000\n• VPS 4GB: Rp 35.000 (Best Seller)\n• VPS 16GB: Rp 70.000',
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