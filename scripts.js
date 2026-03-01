/**
 * HOSTING JADI BESAR - Main JavaScript
 */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    PAKASIR: {
        SLUG: localStorage.getItem('pakasir_slug') || 'hostingjadibesar',
        API_KEY: localStorage.getItem('pakasir_apikey') || '',
        BASE_URL: 'https://app.pakasir.com'
    },
    OPENAI: {
        API_KEY: localStorage.getItem('openai_apikey') || '',
        MODEL: localStorage.getItem('openai_model') || 'gpt-3.5-turbo'
    },
    PTERODACTYL: {
        PANEL_URL: localStorage.getItem('ptero_url') || '',
        PTLA: localStorage.getItem('ptero_ptla') || '',
        PTLC: localStorage.getItem('ptero_ptlc') || ''
    }
};

// ========================================
// PRODUCTS DATA - LENGKAP
// ========================================
const defaultProducts = [
    // === VPS PRODUCTS ===
    { 
        id: 'vps1', category: 'vps', name: 'VPS BASIC 1GB', price: 15000, stock: 15,
        desc: "✅ RAM: 1GB Dedicated\n✅ CPU: 1 Core High Performance\n✅ Storage: 20GB NVMe SSD\n✅ Bandwidth: 1TB\n✅ OS: Linux (Ubuntu/Debian/CentOS)\n🚀 Cocok untuk: Tunneling, Bot Ringan, VPN",
        features: ["1GB RAM", "1 Core CPU", "20GB NVMe", "1TB Bandwidth", "Linux OS"]
    },
    { 
        id: 'vps2', category: 'vps', name: 'VPS BASIC 2GB', price: 25000, stock: 20,
        desc: "✅ RAM: 2GB Dedicated\n✅ CPU: 1 Core High Performance\n✅ Storage: 50GB NVMe SSD\n✅ Bandwidth: 2TB\n✅ Akses Root Full Control\n🚀 Cocok untuk: Hosting Web Kecil, VPN Pribadi",
        features: ["2GB RAM", "1 Core CPU", "50GB NVMe", "2TB Bandwidth", "Root Access"]
    },
    { 
        id: 'vps3', category: 'vps', name: 'VPS STANDARD 2GB', price: 30000, stock: 12,
        desc: "✅ RAM: 2GB Dedicated\n✅ CPU: 2 Core (Multithread)\n✅ Storage: 50GB NVMe SSD\n✅ Bandwidth: 2TB\n✅ Anti-DDoS Basic\n🚀 Cocok untuk: Script Multiprocess, Database",
        features: ["2GB RAM", "2 Core CPU", "50GB NVMe", "2TB Bandwidth", "Anti-DDoS"]
    },
    { 
        id: 'vps4', category: 'vps', name: 'VPS STANDARD 4GB', price: 35000, stock: 25, recommend: true,
        desc: "🔥 BEST SELLER!\n✅ RAM: 4GB Dedicated\n✅ CPU: 2 Core High Performance\n✅ Storage: 80GB NVMe SSD\n✅ Bandwidth: 4TB\n✅ Support Docker\n🚀 Cocok untuk: Game Server (MCPE/SAMP), Bot Music, Store Online",
        features: ["4GB RAM", "2 Core CPU", "80GB NVMe", "4TB Bandwidth", "Docker Support"]
    },
    { 
        id: 'vps5', category: 'vps', name: 'VPS HIGH 8GB', price: 45000, stock: 8,
        desc: "✅ RAM: 8GB Dedicated\n✅ CPU: 4 Core Extreme\n✅ Storage: 160GB NVMe SSD\n✅ Bandwidth: 5TB\n✅ Virtualisasi KVM\n🚀 Cocok untuk: Server Minecraft Java, Website Traffic Tinggi",
        features: ["8GB RAM", "4 Core CPU", "160GB NVMe", "5TB Bandwidth", "KVM"]
    },
    { 
        id: 'vps6', category: 'vps', name: 'VPS PRO 16GB', price: 70000, stock: 5,
        desc: "✅ RAM: 16GB Dedicated\n✅ CPU: 4 Core Extreme\n✅ Storage: 240GB NVMe SSD\n✅ Bandwidth: 5TB\n✅ Network 1Gbps\n🚀 Cocok untuk: Komunitas Game Besar, App Server Berat",
        features: ["16GB RAM", "4 Core CPU", "240GB NVMe", "5TB Bandwidth", "1Gbps Network"]
    },
    { 
        id: 'vps7', category: 'vps', name: 'VPS ENTERPRISE 32GB', price: 120000, stock: 3,
        desc: "👑 ENTERPRISE CLASS\n✅ RAM: 32GB Dedicated\n✅ CPU: 8 Core Xeon\n✅ Storage: 500GB NVMe SSD\n✅ Bandwidth: 10TB\n✅ Priority Support\n🚀 Cocok untuk: Perusahaan, Enterprise App",
        features: ["32GB RAM", "8 Core CPU", "500GB NVMe", "10TB Bandwidth", "Priority Support"]
    },

    // === PANEL PTERODACTYL - HEMAT ===
    { 
        id: 'pnl1', category: 'panel', name: 'PANEL 1GB HEMAT', price: 1000, stock: 100,
        desc: "🔹 RAM: 1GB\n🔹 CPU: 35%\n🔹 Disk: 1GB\n🔹 Server: Indonesia\n✨ Cocok untuk coba-coba atau script bot sangat ringan",
        features: ["1GB RAM", "35% CPU", "1GB Disk", "Indonesia Server"]
    },
    { 
        id: 'pnl2', category: 'panel', name: 'PANEL 2GB HEMAT', price: 2000, stock: 80,
        desc: "🔹 RAM: 2GB\n🔹 CPU: 50%\n🔹 Disk: 2GB\n🔹 Server: Indonesia\n✨ Cocok untuk Bot WhatsApp Single Session",
        features: ["2GB RAM", "50% CPU", "2GB Disk", "Indonesia Server"]
    },
    { 
        id: 'pnl3', category: 'panel', name: 'PANEL 3GB', price: 3000, stock: 60,
        desc: "🔹 RAM: 3GB\n🔹 CPU: 95%\n🔹 Disk: 3GB\n🔹 Server: Indonesia\n✨ Stabil untuk Bot Discord atau WA Multi-Device",
        features: ["3GB RAM", "95% CPU", "3GB Disk", "Indonesia Server"]
    },
    { 
        id: 'pnl4', category: 'panel', name: 'PANEL 4GB', price: 4000, stock: 50,
        desc: "🔹 RAM: 4GB\n🔹 CPU: 110%\n🔹 Disk: 4GB\n🔹 Server: Singapore\n✨ Kuat untuk menjalankan 2-3 script bot sekaligus",
        features: ["4GB RAM", "110% CPU", "4GB Disk", "Singapore Server"]
    },
    { 
        id: 'pnl5', category: 'panel', name: 'PANEL 5GB', price: 5000, stock: 40,
        desc: "🔹 RAM: 5GB\n🔹 CPU: 135%\n🔹 Disk: 5GB\n🔹 Server: Singapore Premium\n✨ Rekomendasi untuk Server SAMP/MTA dengan player sedang",
        features: ["5GB RAM", "135% CPU", "5GB Disk", "Singapore Premium"]
    },
    { 
        id: 'pnl6', category: 'panel', name: 'PANEL 6GB', price: 6000, stock: 35,
        desc: "🔹 RAM: 6GB\n🔹 CPU: 160%\n🔹 Disk: 6GB\n🔹 Server: Singapore Premium\n✨ Performa tinggi untuk kebutuhan hosting medium",
        features: ["6GB RAM", "160% CPU", "6GB Disk", "Singapore Premium"]
    },
    { 
        id: 'pnl7', category: 'panel', name: 'PANEL 7GB', price: 7000, stock: 30,
        desc: "🔹 RAM: 7GB\n🔹 CPU: 185%\n🔹 Disk: 7GB\n🔹 Server: Singapore Premium\n✨ Cocok untuk Bot Music High Quality Audio",
        features: ["7GB RAM", "185% CPU", "7GB Disk", "Singapore Premium"]
    },
    { 
        id: 'pnl8', category: 'panel', name: 'PANEL 8GB TURBO', price: 8000, stock: 25,
        desc: "🔹 RAM: 8GB\n🔹 CPU: 200%\n🔹 Disk: 8GB\n🔹 Server: Singapore Premium\n✨ Sangat lancar untuk Minecraft PE server kecil",
        features: ["8GB RAM", "200% CPU", "8GB Disk", "Singapore Premium"]
    },
    { 
        id: 'pnl9', category: 'panel', name: 'PANEL 9GB TURBO', price: 9000, stock: 20,
        desc: "🔹 RAM: 9GB\n🔹 CPU: 300%\n🔹 Disk: 9GB\n🔹 Performa Stabil & Cepat\n✨ Pilihan terbaik sebelum upgrade ke Unlimited",
        features: ["9GB RAM", "300% CPU", "9GB Disk", "Premium Performance"]
    },
    { 
        id: 'pnl10', category: 'panel', name: 'PANEL 10GB TURBO', price: 10000, stock: 15,
        desc: "🔹 RAM: 10GB\n🔹 CPU: 350%\n🔹 Disk: 10GB\n🔹 Server: Singapore Premium\n✨ Performa maksimal untuk game server medium",
        features: ["10GB RAM", "350% CPU", "10GB Disk", "Premium Server"]
    },

    // === PANEL PREMIUM ===
    { 
        id: 'pnl-unl', category: 'panel', name: 'PANEL UNLIMITED', price: 15000, stock: 10, recommend: true,
        desc: "👑 KHUSUS SULTAN\n♾️ RAM: Unlimited\n♾️ CPU: Unlimited\n♾️ Disk: Unlimited\n🛡️ Garansi Anti Suspend (S&K)\n✨ Bebas deploy apa saja sepuasnya!",
        features: ["Unlimited RAM", "Unlimited CPU", "Unlimited Disk", "Anti Suspend"]
    },
    { 
        id: 'pnl-reseller', category: 'panel', name: 'RESELLER PANEL', price: 25000, stock: 8,
        desc: "💼 PAKET USAHA RESELLER\n✅ Dapat Akun Reseller\n✅ Bisa Membuat Panel Sendiri\n✅ Bisa Jual Panel ke Orang Lain\n✅ Full Support\n💰 Cocok untuk pemula bisnis hosting",
        features: ["Reseller Access", "Create Panel", "Full Support", "Bisnis Ready"]
    },
    { 
        id: 'pnl-admin', category: 'panel', name: 'ADMIN PANEL', price: 35000, stock: 5, recommend: true,
        desc: "💼 PAKET USAHA ADMIN\n✅ Dapat Akun Admin Panel\n✅ Full Akses Create/Delete Server\n✅ Bisa Open Reseller Panel\n✅ Prioritas Support\n💰 Potensi Balik Modal Sangat Cepat!",
        features: ["Admin Access", "Full Control", "Create Reseller", "Priority Support"]
    },
    { 
        id: 'pnl-owner', category: 'panel', name: 'OWNER PANEL', price: 50000, stock: 3,
        desc: "🏢 TINGKAT TERTINGGI\n✅ Akses Panel Owner\n✅ Bisa Bikin Admin & Reseller\n✅ Full Control Resource Server\n✅ Prioritas Support 24/7\n✅ Akses ke Database Panel",
        features: ["Owner Access", "Create Admin", "Full Control", "Database Access"]
    },
    { 
        id: 'pnl-pt', category: 'panel', name: 'PARTNER PANEL', price: 75000, stock: 2, recommend: true,
        desc: "🤝 PAKET PARTNER\n✅ Join Manajemen\n✅ Akses Database Panel\n✅ Bebas Pasang Iklan di Panel\n✅ Full Support Teknis\n✅ Bagi Hasil 70/30",
        features: ["Partner Access", "Database Full", "Custom Ads", "Revenue Share"]
    },

    // === JASA & ADDONS ===
    { 
        id: 'jasa1', category: 'other', name: 'JASA INSTALL PANEL', price: 15000, stock: 999,
        desc: "🛠️ Terima Beres!\nKami instalkan Panel Pterodactyl di VPS Anda.\nTermasuk konfigurasi Domain & SSL (HTTPS).\n✅ Support Ubuntu 20.04/22.04",
        features: ["Panel Install", "Domain Config", "SSL Setup", "Full Support"]
    },
    { 
        id: 'jasa2', category: 'other', name: 'BASH AUTOSCRIPT', price: 20000, stock: 999,
        desc: "📜 Script Auto Install\nBuat Panel Pterodactyl sendiri hanya dengan 1 baris perintah.\n✅ Support Ubuntu 20.04/22.04\n✅ Include Wings Setup",
        features: ["Auto Script", "One Command", "Wings Setup", "Full Tutorial"]
    },
    { 
        id: 'jasa3', category: 'other', name: 'JASA RENAME SCRIPT', price: 25000, stock: 999,
        desc: "✏️ Rebranding Script\nGanti nama author, credit, dan tampilan script bot agar terlihat seperti milik Anda sendiri.\n✅ Include Logo Custom",
        features: ["Rebranding", "Custom Logo", "Full Source", "No Copyright"]
    },
    { 
        id: 'jasa4', category: 'other', name: 'FIX ERROR SCRIPT', price: 10000, stock: 999,
        desc: "🔧 Bot Anda Error?\nKami bantu perbaiki error pada script Bot WA/Telegram/Discord.\n✅ Garansi Fix\n✅ Support 24 Jam",
        features: ["Error Fixing", "All Platforms", "Fast Response", "Guaranteed"]
    },
    { 
        id: 'jasa5', category: 'other', name: 'JASA BUAT WEBSITE', price: 75000, stock: 999,
        desc: "🌐 Website Profesional\nLanding Page, Top Up Game, atau Company Profile.\n✅ Desain Responsif & Modern\n✅ SEO Friendly\n✅ Full Source Code",
        features: ["Responsive Design", "Modern UI", "SEO Friendly", "Full Source"]
    },
    { 
        id: 'jasa6', category: 'other', name: 'JASA BUAT BOT WA', price: 50000, stock: 999,
        desc: "🤖 Bot WhatsApp Custom\nBot sesuai kebutuhan Anda dengan fitur lengkap.\n✅ Include Deploy\n✅ Full Source Code\n✅ Tutorial Penggunaan",
        features: ["Custom Bot", "Full Feature", "Include Deploy", "Tutorial"]
    },
    { 
        id: 'jasa7', category: 'other', name: 'JASA OPTIMASI VPS', price: 20000, stock: 999,
        desc: "⚡ Optimasi Performa VPS\nTuning VPS untuk performa maksimal.\n✅ Swap Config\n✅ Network Optimize\n✅ Security Hardening",
        features: ["Performance Tuning", "Swap Config", "Network Optimize", "Security"]
    },
    { 
        id: 'jasa8', category: 'other', name: 'JASA BACKUP & RESTORE', price: 15000, stock: 999,
        desc: "💾 Backup & Restore Data\nBackup data penting Anda ke cloud storage.\n✅ Google Drive\n✅ Auto Schedule\n✅ Easy Restore",
        features: ["Cloud Backup", "Auto Schedule", "Easy Restore", "Full Support"]
    }
];

// ========================================
// DEFAULT TESTIMONIALS (50 Items)
// ========================================
const defaultTestimonials = [
    { id: 1, name: "Zaki_MCPE", rating: 5, message: "Gila vps 4gb nya kenceng bgt bang buat server mcpe. Lancar jaya gak ada lag sama sekali padahal player rame. Thx min!", date: "2026-02-18" },
    { id: 2, name: "Fauzan.dev", rating: 5, message: "Awalnya iseng nyoba panel 1gb hemat buat naruh script bot wa doang, eh ternyata stabil bngt. Harga seribu perak dapet segini mah worth it parah.", date: "2026-02-17" },
    { id: 3, name: "Rizky Store", rating: 4, message: "Makasih mase, jasa buat web top up ku jadi cakep. cuma revisi warna temanya lumayan nunggu lama balasan adminnya wkwk. tp overal hasil mantap.", date: "2026-02-15" },
    { id: 4, name: "Dika Santoso", rating: 5, message: "Sultan beneran ini mah panel unlimitednya. Udah deploy 5 server barengan resource masi aman sentosa, ga kena suspend.", date: "2026-02-14" },
    { id: 5, name: "Bima_Aji", rating: 4, message: "Fitur bot wa nya lengkap bgt sesuai rikues, tp jujur awal2 agak bingung cara run nya di panel. untung adminnya sabar njelasin sampe bisa.", date: "2026-02-12" },
    { id: 6, name: "Kelvin.jr", rating: 5, message: "Penyelamat bgt asli!! Script bot ku error dari kemarin, pake jasa fix error langsung jalan lagi normal. murah lg wkwk", date: "2026-02-10" },
    { id: 7, name: "Sandi VPN", rating: 4, message: "Vps basic 1gb nya mayan bgt buat tunneling pribadi. ping sempet naik turun kmrn siang tp skrg dah stabil lg jos.", date: "2026-02-08" },
    { id: 8, name: "Tegar_SAMP", rating: 5, message: "Pake panel 10gb turbo buat server SAMP, ping nya dapet ijo terus bang. Server SG premium nya emang beda.", date: "2026-02-05" },
    { id: 9, name: "Agung_Store", rating: 5, message: "Jasa rename script nya rapih bang. Sekarang bot nya udah full pake nama & logo store ku sendiri. Keren euy", date: "2026-02-03" },
    { id: 10, name: "Rio.P", rating: 3, message: "Order jasa install panel ptero ke vps sendiri. jujur agak lama prosesnya ampe 3 jam karna katanya lg antri panjang. tp yaudah lah yg penting panel nyala normal.", date: "2026-02-01" },
    { id: 11, name: "CEO_Ngelag", rating: 5, message: "Beli VPS Enterprise 32GB buat database kantor, gila ngacir bener bang. Xeon 8 core nya ga main-main.", date: "2026-01-29" },
    { id: 12, name: "Rafly_MTA", rating: 5, message: "Panel 5gb nya pas bgt buat server MTA player 50an. Harga 5rb doang udah dapet server SG Premium.", date: "2026-01-28" },
    { id: 13, name: "Cuan_Maksimal", rating: 5, message: "Paket reseller panelnya mantap min, modal 25rb udah bisa jualan panel ptero sendiri. Auto balik modal ini mah hahaha", date: "2026-01-26" },
    { id: 14, name: "Ivan_Tkj", rating: 4, message: "Jasa optimasi vps nya ngaruh bgt. Serverku awalnya sering OOM mati sendiri, abis disettingin swap jadi agak mendingan lah.", date: "2026-01-25" },
    { id: 15, name: "Fajar_Hosting", rating: 5, message: "Backup & Restore nya ngebantu bgt pas kemaren ganti vps. Data bot aman semua pindah dgn selamat.", date: "2026-01-22" },
];

// ========================================
// RATE LIMITER (ANTI DDOS)
// ========================================
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    checkLimit(identifier, maxRequests = 50) {
        const now = Date.now();
        const windowStart = now - 60000;
        
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const userRequests = this.requests.get(identifier);
        const validRequests = userRequests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        return true;
    }

    cleanup() {
        const now = Date.now();
        const windowStart = now - 60000;
        
        for (const [identifier, times] of this.requests.entries()) {
            const validTimes = times.filter(time => time > windowStart);
            if (validTimes.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, validTimes);
            }
        }
    }
}

const rateLimiter = new RateLimiter();

// ========================================
// UTILITY FUNCTIONS
// ========================================
const Utils = {
    formatRupiah(num) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generateOrderId() {
        const prefix = 'HJBS';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getClientId() {
        let id = localStorage.getItem('client_id');
        if (!id) {
            id = 'client_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('client_id', id);
        }
        return id;
    },

    animateCounter(el, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start);
            }
        }, 16);
    }
};

// ========================================
// PRODUCT MANAGER
// ========================================
const ProductManager = {
    init() {
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify(defaultProducts));
        }
    },

    getAll() {
        return JSON.parse(localStorage.getItem('products')) || defaultProducts;
    },

    getById(id) {
        return this.getAll().find(p => p.id === id);
    },

    getByCategory(category) {
        if (category === 'all') return this.getAll();
        return this.getAll().filter(p => p.category === category);
    },

    updateStock(productId, quantity) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1 && products[index].category !== 'other') {
            products[index].stock = Math.max(0, products[index].stock - quantity);
            localStorage.setItem('products', JSON.stringify(products));
            return true;
        }
        return false;
    },

    restock(productId, quantity) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index].stock = (products[index].stock || 0) + quantity;
            localStorage.setItem('products', JSON.stringify(products));
            return true;
        }
        return false;
    }
};

// ========================================
// CART MANAGER
// ========================================
const CartManager = {
    getItems() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch {
            return [];
        }
    },

    saveItems(items) {
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateUI();
    },

    addItem(product, quantity = 1) {
        if (!rateLimiter.checkLimit(Utils.getClientId() + '_cart')) {
            Utils.showToast('Terlalu banyak permintaan. Coba lagi nanti.', 'error');
            return false;
        }

        const cart = this.getItems();
        const existingItem = cart.find(item => item.id === product.id);
        
        // Check stock
        if (product.category !== 'other') {
            const currentQty = existingItem ? existingItem.quantity : 0;
            if (currentQty + quantity > product.stock) {
                Utils.showToast('Stok tidak mencukupi!', 'error');
                return false;
            }
        }

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                category: product.category
            });
        }

        this.saveItems(cart);
        Utils.showToast(`${product.name} ditambahkan ke keranjang!`);
        return true;
    },

    removeItem(index) {
        const cart = this.getItems();
        cart.splice(index, 1);
        this.saveItems(cart);
        renderCart();
    },

    updateQuantity(index, newQuantity) {
        const cart = this.getItems();
        const product = ProductManager.getById(cart[index].id);
        
        if (product && product.category !== 'other' && newQuantity > product.stock) {
            Utils.showToast('Stok tidak mencukupi!', 'error');
            return false;
        }

        if (newQuantity <= 0) {
            this.removeItem(index);
        } else {
            cart[index].quantity = newQuantity;
            this.saveItems(cart);
            renderCart();
        }
        return true;
    },

    clear() {
        localStorage.removeItem('cart');
        this.updateUI();
    },

    getTotal() {
        return this.getItems().reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemCount() {
        return this.getItems().reduce((count, item) => count + item.quantity, 0);
    },

    updateUI() {
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            const count = this.getItemCount();
            countEl.textContent = count;
            countEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }
};

// ========================================
// TESTIMONIAL MANAGER
// ========================================
const TestimonialManager = {
    init() {
        if (!localStorage.getItem('testimonials')) {
            localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));
        }
    },

    getAll() {
        return JSON.parse(localStorage.getItem('testimonials')) || defaultTestimonials;
    },

    add(testimonial) {
        if (!rateLimiter.checkLimit(Utils.getClientId() + '_testimonial')) {
            Utils.showToast('Terlalu banyak permintaan. Coba lagi nanti.', 'error');
            return false;
        }

        const testimonials = this.getAll();
        testimonial.id = Date.now();
        testimonial.date = new Date().toISOString().split('T')[0];
        testimonials.push(testimonial);
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        return true;
    }
};

// ========================================
// CHATBOT (TERHUBUNG KE OPENAI API)
// ========================================
const ChatBot = {
    async getResponse(message) {
        if (!rateLimiter.checkLimit(Utils.getClientId() + '_chat', 30)) {
            return 'Maaf, terlalu banyak permintaan. Silakan tunggu sebentar.';
        }

        try {
            // Ambil pilihan model dari pengaturan Admin (default ke gpt-3.5-turbo jika kosong)
            const selectedModel = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
            
            // Panggil API backend yang ada di Vercel
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    message: message,
                    model: selectedModel // Kirim model ke backend
                })
            });

            if (!response.ok) {
                throw new Error('Gagal terhubung ke API OpenAI');
            }

            const data = await response.json();
            return data.reply;

        } catch (error) {
            console.error('Chat error:', error);
            
            // Mode Offline / Fallback (Berjalan jika tes lokal tanpa Vercel atau API Error)
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

            const lowerMsg = message.toLowerCase();
            for (const [key, fallbackResponse] of Object.entries(responses)) {
                if (lowerMsg.includes(key)) return fallbackResponse;
            }

            return 'Maaf, saya belum mengerti pertanyaan tersebut. Silakan hubungi admin via WhatsApp: +62 822-2676-9163 📞';
        }
    }
};

// ========================================
// PAKASIR PAYMENT
// ========================================
const PakasirPayment = {
    createPaymentUrl(amount, orderId) {
        const baseUrl = `${CONFIG.PAKASIR.BASE_URL}/pay/${CONFIG.PAKASIR.SLUG}/${amount}`;
        const params = new URLSearchParams({
            order_id: orderId,
            redirect: window.location.origin + '/payment-success.html'
        });
        return `${baseUrl}?${params.toString()}`;
    },

    async processCheckout() {
        const cart = CartManager.getItems();
        if (cart.length === 0) {
            Utils.showToast('Keranjang masih kosong!', 'error');
            return;
        }

        const total = CartManager.getTotal();
        const orderId = Utils.generateOrderId();

        // Save order info
        localStorage.setItem('current_order', JSON.stringify({
            orderId,
            items: cart,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        }));

        // Reduce stock
        cart.forEach(item => {
            ProductManager.updateStock(item.id, item.quantity);
        });

        // Save to sales history
        const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
        cart.forEach(item => {
            salesHistory.push({
                ...item,
                orderId,
                date: new Date().toISOString(),
                status: 'pending'
            });
        });
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

        // Redirect to Pakasir
        window.location.href = this.createPaymentUrl(total, orderId);
    }
};

// ========================================
// RENDER FUNCTIONS
// ========================================
let currentModalProduct = null;
let currentModalQty = 1;

function renderProducts(category = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const products = ProductManager.getByCategory(category);
    
    grid.innerHTML = products.map(product => {
        const isOutOfStock = product.category !== 'other' && product.stock <= 0;
        const stockClass = isOutOfStock ? 'out' : (product.stock <= 5 ? 'limited' : 'available');
        const stockText = isOutOfStock ? 'HABIS' : `Stok: ${product.stock}`;
        
        const icons = { vps: 'fa-server', panel: 'fa-gamepad', other: 'fa-tools' };
        
        return `
            <div class="product-card ${product.recommend ? 'best-seller' : ''}">
                <div class="product-header">
                    ${product.category !== 'other' ? `<span class="stock-badge ${stockClass}">${stockText}</span>` : ''}
                    <div class="product-icon"><i class="fas ${icons[product.category]}"></i></div>
                    <h3>${product.name}</h3>
                    <div class="product-price">${Utils.formatRupiah(product.price)}</div>
                </div>
                <p class="product-desc">${product.desc.split('\n')[0]}</p>
                <div class="product-footer">
                    <button class="btn btn-primary" onclick='showProductDetail(${JSON.stringify(product)})' ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'Habis' : 'Beli'}
                    </button>
                    <button class="btn btn-outline" onclick='showProductDetail(${JSON.stringify(product)})'>
                        <i class="fas fa-info-circle"></i> Detail
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Update quick buy select
    const quickSelect = document.getElementById('quick-product');
    if (quickSelect) {
        quickSelect.innerHTML = '<option value="">Pilih Layanan...</option>' + 
            products.filter(p => p.category !== 'other' || p.stock > 0).map(p => 
                `<option value="${p.id}">${p.name} - ${Utils.formatRupiah(p.price)}</option>`
            ).join('');
    }
}

function showProductDetail(product) {
    currentModalProduct = product;
    currentModalQty = 1;
    
    const modal = document.getElementById('product-modal');
    const categoryLabels = { vps: 'VPS Cloud', panel: 'Panel Pterodactyl', other: 'Jasa & Addons' };
    
    document.getElementById('modal-category').textContent = categoryLabels[product.category];
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = Utils.formatRupiah(product.price);
    document.getElementById('modal-desc').innerHTML = product.desc.replace(/\n/g, '<br>');
    document.getElementById('modal-qty').value = 1;
    
    const featuresHtml = product.features ? product.features.map(f => 
        `<li><i class="fas fa-check"></i> ${f}</li>`
    ).join('') : '';
    document.getElementById('modal-features').innerHTML = `<ul>${featuresHtml}</ul>`;
    
    const stockEl = document.getElementById('modal-stock');
    if (product.category !== 'other') {
        stockEl.innerHTML = `
            <i class="fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>Stok: ${product.stock} tersedia</span>
        `;
        stockEl.style.color = product.stock > 0 ? 'var(--accent)' : 'var(--danger)';
    } else {
        stockEl.innerHTML = '<i class="fas fa-infinity"></i> <span>Selalu tersedia</span>';
        stockEl.style.color = 'var(--accent)';
    }
    
    const addBtn = document.getElementById('modal-add-btn');
    const isOutOfStock = product.category !== 'other' && product.stock <= 0;
    addBtn.disabled = isOutOfStock;
    addBtn.innerHTML = isOutOfStock ? 
        '<i class="fas fa-times"></i> Stok Habis' : 
        '<i class="fas fa-cart-plus"></i> Tambah ke Keranjang';
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    currentModalProduct = null;
}

function changeModalQty(delta) {
    currentModalQty = Math.max(1, currentModalQty + delta);
    document.getElementById('modal-qty').value = currentModalQty;
}

function addToCartFromModal() {
    if (currentModalProduct) {
        CartManager.addItem(currentModalProduct, currentModalQty);
        closeProductModal();
    }
}

function quickBuy() {
    const select = document.getElementById('quick-product');
    const productId = select.value;
    
    if (!productId) {
        Utils.showToast('Pilih layanan terlebih dahulu!', 'warning');
        return;
    }
    
    const product = ProductManager.getById(productId);
    if (product) {
        CartManager.addItem(product, 1);
        window.location.href = '#cart';
    }
}

function renderCart() {
    const main = document.getElementById('cart-main');
    const sidebar = document.getElementById('cart-sidebar');
    const items = CartManager.getItems();

    if (!main) return;

    if (items.length === 0) {
        main.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon"><i class="fas fa-shopping-cart"></i></div>
                <h3>Keranjang Masih Kosong</h3>
                <p>Yuk, pilih layanan yang Anda butuhkan!</p>
                <a href="#services" class="btn btn-primary"><i class="fas fa-arrow-right"></i> Lihat Layanan</a>
            </div>
        `;
        if (sidebar) sidebar.style.display = 'none';
        return;
    }

    const icons = { vps: 'fa-server', panel: 'fa-gamepad', other: 'fa-tools' };
    
    main.innerHTML = items.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-icon"><i class="fas ${icons[item.category]}"></i></div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${Utils.formatRupiah(item.price)}/item</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, ${item.quantity - 1})"><i class="fas fa-minus"></i></button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="CartManager.updateQuantity(${index}, ${item.quantity + 1})"><i class="fas fa-plus"></i></button>
            </div>
            <div class="cart-item-total">${Utils.formatRupiah(item.price * item.quantity)}</div>
            <button class="cart-item-remove" onclick="CartManager.removeItem(${index})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    if (sidebar) {
        sidebar.style.display = 'block';
        const subtotal = CartManager.getTotal();
        const discount = 0;
        const total = subtotal - discount;
        
        document.getElementById('subtotal-price').textContent = Utils.formatRupiah(subtotal);
        document.getElementById('discount-price').textContent = Utils.formatRupiah(discount);
        document.getElementById('total-price').textContent = Utils.formatRupiah(total);
    }
}

// ========================================
// RENDER TESTIMONIALS (SUPER FIX VISUAL BINTANG KOSONG)
// ========================================
function renderTestimonials() {
    const container = document.getElementById('testimonials-slider');
    if (!container) return;

    const testimonials = TestimonialManager.getAll().slice().reverse();
    
    container.innerHTML = testimonials.map(t => {
        // PERBAIKAN: Pakai class 'fas' untuk bintang penuh (kuning), 'far' untuk bintang kosong (abu-abu)
        const stars = Array(5).fill(0).map((_, i) => 
            `<i class="${i < t.rating ? 'fas' : 'far'} fa-star" style="color: ${i < t.rating ? 'var(--warning)' : '#4b5563'};"></i>`
        ).join('');
        
        const initials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${initials}</div>
                    <div class="testimonial-info">
                        <h4>${t.name}</h4>
                        <div class="testimonial-date">${Utils.formatDate(t.date)}</div>
                    </div>
                </div>
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-text">${t.message}</p>
            </div>
        `;
    }).join('');
}

// ========================================
// TESTIMONIAL MODAL
// ========================================
function openTestimonialModal() {
    document.getElementById('testimonial-modal').classList.add('active');
}

function closeTestimonialModal() {
    document.getElementById('testimonial-modal').classList.remove('active');
}

// ========================================
// PROMO CODE
// ========================================
function applyPromo() {
    const code = document.getElementById('promo-code').value.trim().toUpperCase();
    
    if (code === 'BESAR20') {
        Utils.showToast('Kode promo BESAR20 berhasil! Diskon 20%', 'success');
    } else if (code) {
        Utils.showToast('Kode promo tidak valid!', 'error');
    } else {
        Utils.showToast('Masukkan kode promo!', 'warning');
    }
}

// ========================================
// CHECKOUT
// ========================================
function processCheckout() {
    PakasirPayment.processCheckout();
}

// ========================================
// INITIALIZATION & EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Init data
    ProductManager.init();
    TestimonialManager.init();
    
    // Render UI
    renderProducts();
    renderCart();
    renderTestimonials();
    CartManager.updateUI();
    
    // Loading screen
    setTimeout(() => {
        document.getElementById('loading-screen')?.classList.add('hidden');
    }, 1500);
    
    // Counter animation
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseFloat(el.dataset.count);
        if (target) Utils.animateCounter(el, target);
    });
    
    // Theme toggle
    document.getElementById('theme-btn')?.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        document.getElementById('theme-btn').innerHTML = isLight ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-btn').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
    });
    
    // Category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.dataset.category);
        });
    });
    
    // Chat widget
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    
    chatToggle?.addEventListener('click', () => {
        chatWidget.classList.add('active');
        chatToggle.style.display = 'none';
    });
    
    chatClose?.addEventListener('click', () => {
        chatWidget.classList.remove('active');
        chatToggle.style.display = 'block';
    });
    
    document.getElementById('chat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;
        
        const body = document.getElementById('chat-body');
        body.innerHTML += `<div class="chat-message user"><div class="message-content">${message}</div></div>`;
        input.value = '';
        body.scrollTop = body.scrollHeight;
        
        const response = await ChatBot.getResponse(message);
        body.innerHTML += `<div class="chat-message bot"><div class="message-content">${response.replace(/\n/g, '<br>')}</div></div>`;
        body.scrollTop = body.scrollHeight;
    });
    
    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('active');
        });
    });
    
    // ==========================================
    // RATING & TESTIMONIAL SYSTEM (JURUS PAMUNGKAS)
    // ==========================================
    const ratingContainer = document.getElementById('rating-input');
    const ratingInput = document.getElementById('testi-rating');
    const oldTestiForm = document.getElementById('testimonial-form');

    // 1. Logika Klik Bintang Input Form
    if (ratingContainer && ratingInput) {
        const stars = Array.from(ratingContainer.querySelectorAll('i'));
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const ratingValue = index + 1; // Pasti dapat angka 1 sampai 5
                ratingInput.value = ratingValue; // Masukkan ke input tersembunyi
                
                // Warnai bintang saat diklik
                stars.forEach((s, i) => {
                    if (i < ratingValue) {
                        s.className = 'fas fa-star active'; // Bintang penuh
                        s.style.color = '#ffc107'; 
                    } else {
                        s.className = 'far fa-star'; // Bintang kosong
                        s.style.color = '#ccc';
                    }
                });
            });
        });
    }

    // 2. Logika Submit
    if (oldTestiForm) {
        // Clone form untuk mematikan semua event listener lama
        const testiForm = oldTestiForm.cloneNode(true);
        oldTestiForm.parentNode.replaceChild(testiForm, oldTestiForm);

        testiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('testi-name').value;
            const message = document.getElementById('testi-message').value;
            // Ambil rating pasti (default 5 jika gagal terdeteksi)
            const rating = parseInt(document.getElementById('testi-rating').value) || 5; 
            
            if (TestimonialManager.add({ name, rating, message })) {
                Utils.showToast('Testimoni berhasil ditambahkan!');
                renderTestimonials();
                closeTestimonialModal();
                testiForm.reset();
                
                // Kembalikan form bintang ke posisi semula (5 bintang)
                if (ratingInput) ratingInput.value = 5;
                if (ratingContainer) {
                    const stars = Array.from(ratingContainer.querySelectorAll('i'));
                    stars.forEach(s => {
                        s.className = 'fas fa-star active';
                        s.style.color = '#ffc107';
                    });
                }
            }
        });
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Abaikan jika link-nya cuma tanda '#' kosong
            if (href === '#') return; 
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('nav-menu')?.classList.remove('active');
            }
        });
    });
    
    // Active nav on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// Expose functions globally
window.showProductDetail = showProductDetail;
window.closeProductModal = closeProductModal;
window.changeModalQty = changeModalQty;
window.addToCartFromModal = addToCartFromModal;
window.quickBuy = quickBuy;
window.openTestimonialModal = openTestimonialModal;
window.closeTestimonialModal = closeTestimonialModal;
window.applyPromo = applyPromo;
window.processCheckout = processCheckout;
window.CartManager = CartManager;
window.ProductManager = ProductManager;
window.TestimonialManager = TestimonialManager;
window.Utils = Utils;
