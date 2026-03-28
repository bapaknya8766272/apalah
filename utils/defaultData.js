// ========================================
// DEFAULT PRODUCTS DATA
// ========================================

export const defaultProducts = [
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
// DEFAULT TESTIMONIALS DATA
// ========================================

export const defaultTestimonials = [
    { name: "Zaki_MCPE", rating: 5, message: "Gila vps 4gb nya kenceng bgt bang buat server mcpe. Lancar jaya gak ada lag sama sekali padahal player rame. Thx min!", isApproved: true },
    { name: "Fauzan.dev", rating: 5, message: "Awalnya iseng nyoba panel 1gb hemat buat naruh script bot wa doang, eh ternyata stabil bngt. Harga seribu perak dapet segini mah worth it parah.", isApproved: true },
    { name: "Rizky Store", rating: 4, message: "Makasih mase, jasa buat web top up ku jadi cakep. cuma revisi warna temanya lumayan nunggu lama balasan adminnya wkwk. tp overal hasil mantap.", isApproved: true },
    { name: "Dika Santoso", rating: 5, message: "Sultan beneran ini mah panel unlimitednya. Udah deploy 5 server barengan resource masi aman sentosa, ga kena suspend.", isApproved: true },
    { name: "Bima_Aji", rating: 4, message: "Fitur bot wa nya lengkap bgt sesuai rikues, tp jujur awal2 agak bingung cara run nya di panel. untung adminnya sabar njelasin sampe bisa.", isApproved: true },
    { name: "Kelvin.jr", rating: 5, message: "Penyelamat bgt asli!! Script bot ku error dari kemarin, pake jasa fix error langsung jalan lagi normal. murah lg wkwk", isApproved: true },
    { name: "Sandi VPN", rating: 4, message: "Vps basic 1gb nya mayan bgt buat tunneling pribadi. ping sempet naik turun kmrn siang tp skrg dah stabil lg jos.", isApproved: true },
    { name: "Tegar_SAMP", rating: 5, message: "Pake panel 10gb turbo buat server SAMP, ping nya dapet ijo terus bang. Server SG premium nya emang beda.", isApproved: true },
    { name: "Agung_Store", rating: 5, message: "Jasa rename script nya rapih bang. Sekarang bot nya udah full pake nama & logo store ku sendiri. Keren euy", isApproved: true },
    { name: "CEO_Ngelag", rating: 5, message: "Beli VPS Enterprise 32GB buat database kantor, gila ngacir bener bang. Xeon 8 core nya ga main-main.", isApproved: true },
    { name: "Rafly_MTA", rating: 5, message: "Panel 5gb nya pas bgt buat server MTA player 50an. Harga 5rb doang udah dapet server SG Premium.", isApproved: true },
    { name: "Cuan_Maksimal", rating: 5, message: "Paket reseller panelnya mantap min, modal 25rb udah bisa jualan panel ptero sendiri. Auto balik modal ini mah hahaha", isApproved: true },
    { name: "Ivan_Tkj", rating: 4, message: "Jasa optimasi vps nya ngaruh bgt. Serverku awalnya sering OOM mati sendiri, abis disettingin swap jadi agak mendingan lah.", isApproved: true },
    { name: "Fajar_Hosting", rating: 5, message: "Backup & Restore nya ngebantu bgt pas kemaren ganti vps. Data bot aman semua pindah dgn selamat.", isApproved: true },
    { name: "Aldi_Gaming", rating: 5, message: "VPS 4GB nya the best buat server Minecraft. Ga pernah lag dan supportnya cepet balesnya. Recommended!", isApproved: true }
];
