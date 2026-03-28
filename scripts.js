/**
 * ALFA HOSTING - Main JavaScript
 * MongoDB Backend Version
 */

// ========================================
// API CONFIGURATION
// ========================================
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';

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
        const prefix = 'ALFA';
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
    },

    // API helper
    async apiCall(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Terjadi kesalahan koneksi.' };
        }
    }
};

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
// PRODUCT MANAGER
// ========================================
const ProductManager = {
    products: [],

    async init() {
        await this.loadProducts();
    },

    async loadProducts() {
        const response = await Utils.apiCall('/products');
        if (response.success) {
            this.products = response.data;
        }
    },

    getAll() {
        return this.products;
    },

    getById(id) {
        return this.products.find(p => p.id === id);
    },

    getByCategory(category) {
        if (category === 'all') return this.products;
        return this.products.filter(p => p.category === category);
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
    testimonials: [],

    async init() {
        await this.loadTestimonials();
    },

    async loadTestimonials() {
        const response = await Utils.apiCall('/testimonials');
        if (response.success) {
            this.testimonials = response.data;
        }
    },

    getAll() {
        return this.testimonials;
    },

    async add(testimonial) {
        if (!rateLimiter.checkLimit(Utils.getClientId() + '_testimonial')) {
            Utils.showToast('Terlalu banyak permintaan. Coba lagi nanti.', 'error');
            return false;
        }

        const response = await Utils.apiCall('/testimonials', {
            method: 'POST',
            body: JSON.stringify(testimonial)
        });

        if (response.success) {
            await this.loadTestimonials();
            return true;
        } else {
            Utils.showToast(response.message || 'Gagal menambahkan testimoni.', 'error');
            return false;
        }
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
            const response = await Utils.apiCall('/openai/chat', {
                method: 'POST',
                body: JSON.stringify({ message })
            });

            if (response.success) {
                return response.data.reply;
            }
            
            throw new Error('API Error');
        } catch (error) {
            console.error('Chat error:', error);
            
            // Fallback responses
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
        const slug = localStorage.getItem('pakasir_slug') || 'alfahosting';
        const baseUrl = `https://app.pakasir.com/pay/${slug}/${amount}`;
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

        // Create order in backend
        const response = await Utils.apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify({
                orderId,
                items: cart,
                total,
                status: 'pending'
            })
        });

        if (!response.success) {
            Utils.showToast(response.message || 'Gagal membuat pesanan.', 'error');
            return;
        }

        // Save order info locally
        localStorage.setItem('current_order', JSON.stringify({
            orderId,
            items: cart,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        }));

        // Clear cart
        CartManager.clear();

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
// RENDER TESTIMONIALS
// ========================================
function renderTestimonials() {
    const container = document.getElementById('testimonials-slider');
    if (!container) return;

    const testimonials = TestimonialManager.getAll().slice().reverse();
    
    container.innerHTML = testimonials.map(t => {
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
                        <div class="testimonial-date">${Utils.formatDate(t.createdAt || t.date)}</div>
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
document.addEventListener('DOMContentLoaded', async () => {
    // Init data
    await ProductManager.init();
    await TestimonialManager.init();
    
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
    
    // Rating & Testimonial System
    const ratingContainer = document.getElementById('rating-input');
    const ratingInput = document.getElementById('testi-rating');
    const oldTestiForm = document.getElementById('testimonial-form');

    // Logika Klik Bintang Input Form
    if (ratingContainer && ratingInput) {
        const stars = Array.from(ratingContainer.querySelectorAll('i'));
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const ratingValue = index + 1;
                ratingInput.value = ratingValue;
                
                stars.forEach((s, i) => {
                    if (i < ratingValue) {
                        s.className = 'fas fa-star active';
                        s.style.color = '#ffc107'; 
                    } else {
                        s.className = 'far fa-star';
                        s.style.color = '#ccc';
                    }
                });
            });
        });
    }

    // Logika Submit Testimonial
    if (oldTestiForm) {
        const testiForm = oldTestiForm.cloneNode(true);
        oldTestiForm.parentNode.replaceChild(testiForm, oldTestiForm);

        testiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('testi-name').value;
            const message = document.getElementById('testi-message').value;
            const rating = parseInt(document.getElementById('testi-rating').value) || 5;
            
            const success = await TestimonialManager.add({ name, rating, message });
            
            if (success) {
                Utils.showToast('Testimoni berhasil ditambahkan!');
                renderTestimonials();
                closeTestimonialModal();
                testiForm.reset();
                
                // Reset stars
                const stars = ratingContainer?.querySelectorAll('i');
                stars?.forEach((s, i) => {
                    s.className = i < 5 ? 'fas fa-star active' : 'far fa-star';
                    s.style.color = i < 5 ? '#ffc107' : '#ccc';
                });
            }
        });
    }
});

// Expose functions to global scope
window.showProductDetail = showProductDetail;
window.closeProductModal = closeProductModal;
window.changeModalQty = changeModalQty;
window.addToCartFromModal = addToCartFromModal;
window.quickBuy = quickBuy;
window.openTestimonialModal = openTestimonialModal;
window.closeTestimonialModal = closeTestimonialModal;
window.applyPromo = applyPromo;
window.processCheckout = processCheckout;
