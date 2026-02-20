/**
 * HOSTING JADI BESAR - Admin Panel JavaScript
 * Enhanced Security Version
 */

// ========================================
// SECURITY CONFIGURATION
// ========================================
const SECURITY = {
    // SHA256 of 'admin123' - CHANGE THIS!
    USERNAME_HASH: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    PASSWORD_HASH: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    
    SESSION_DURATION: 60 * 60 * 1000, // 1 hour
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    
    // Store login attempts
    attempts: parseInt(localStorage.getItem('login_attempts') || '0'),
    lockoutEnd: parseInt(localStorage.getItem('lockout_end') || '0')
};

// ========================================
// CRYPTO UTILS
// ========================================
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getClientIP() {
    // In real implementation, this would come from server
    // For client-side, we use a fingerprint
    return localStorage.getItem('client_fingerprint') || generateFingerprint();
}

function generateFingerprint() {
    const fp = navigator.userAgent + navigator.language + screen.width + screen.height;
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
        const char = fp.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const fingerprint = Math.abs(hash).toString(16);
    localStorage.setItem('client_fingerprint', fingerprint);
    return fingerprint;
}

// ========================================
// SESSION MANAGEMENT
// ========================================
const SessionManager = {
    timer: null,
    remaining: 60 * 60, // seconds

    start() {
        this.remaining = parseInt(localStorage.getItem('session_timeout') || '3600');
        this.updateDisplay();
        
        this.timer = setInterval(() => {
            this.remaining--;
            this.updateDisplay();
            
            if (this.remaining <= 0) {
                this.expire();
            }
            
            // Warning at 5 minutes
            if (this.remaining === 300) {
                Swal.fire({
                    title: 'Sesi Hampir Habis',
                    text: 'Sesi Anda akan berakhir dalam 5 menit. Lanjutkan?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Lanjutkan',
                    cancelButtonText: 'Logout',
                    background: '#1a1a2e',
                    color: '#fff'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.extend();
                    } else {
                        logout();
                    }
                });
            }
        }, 1000);
    },

    updateDisplay() {
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        const display = document.getElementById('session-timer');
        if (display) {
            display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    },

    extend() {
        this.remaining = parseInt(localStorage.getItem('session_timeout') || '3600');
        sessionStorage.setItem('session_start', Date.now().toString());
    },

    expire() {
        clearInterval(this.timer);
        Swal.fire({
            title: 'Sesi Berakhir',
            text: 'Sesi Anda telah berakhir. Silakan login kembali.',
            icon: 'info',
            confirmButtonText: 'OK',
            background: '#1a1a2e',
            color: '#fff'
        }).then(() => {
            logout();
        });
    },

    stop() {
        clearInterval(this.timer);
    }
};

// ========================================
// LOGIN SYSTEM
// ========================================
async function login() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('login-error');
    const attemptsEl = document.getElementById('login-attempts');
    
    // Check lockout
    if (Date.now() < SECURITY.lockoutEnd) {
        const remaining = Math.ceil((SECURITY.lockoutEnd - Date.now()) / 60000);
        Swal.fire({
            title: 'Akun Terkunci',
            text: `Terlalu banyak percobaan gagal. Coba lagi dalam ${remaining} menit.`,
            icon: 'error',
            background: '#1a1a2e',
            color: '#fff'
        });
        return;
    }
    
    if (!username || !password) {
        showLoginError('Username dan password harus diisi!');
        return;
    }
    
    // Verify credentials
    const usernameHash = await sha256(username);
    const passwordHash = await sha256(password);
    
    if (usernameHash === SECURITY.USERNAME_HASH && passwordHash === SECURITY.PASSWORD_HASH) {
        // Success - reset attempts
        SECURITY.attempts = 0;
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('lockout_end');
        
        // Create session
        const sessionToken = generateSessionToken();
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('session_token', sessionToken);
        sessionStorage.setItem('session_start', Date.now().toString());
        sessionStorage.setItem('client_ip', getClientIP());
        
        showDashboard();
    } else {
        // Failed
        SECURITY.attempts++;
        localStorage.setItem('login_attempts', SECURITY.attempts);
        
        const remaining = SECURITY.MAX_LOGIN_ATTEMPTS - SECURITY.attempts;
        
        if (attemptsEl) {
            attemptsEl.querySelector('span').textContent = remaining;
            attemptsEl.style.display = 'block';
        }
        
        if (SECURITY.attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
            SECURITY.lockoutEnd = Date.now() + SECURITY.LOCKOUT_DURATION;
            localStorage.setItem('lockout_end', SECURITY.lockoutEnd);
            
            Swal.fire({
                title: 'Akun Terkunci',
                text: 'Terlalu banyak percobaan gagal. Akun terkunci selama 15 menit.',
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff'
            });
        } else {
            showLoginError(`Username atau password salah! (${remaining} percobaan tersisa)`);
        }
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('login-error');
    errorEl.querySelector('span').textContent = message;
    errorEl.classList.add('show');
    
    // Shake animation
    const loginBox = document.querySelector('.login-box');
    loginBox.style.animation = 'shake 0.5s';
    setTimeout(() => loginBox.style.animation = '', 500);
}

function togglePassword() {
    const input = document.getElementById('admin-password');
    const btn = document.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        btn.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function logout() {
    SessionManager.stop();
    sessionStorage.clear();
    location.reload();
}

function checkAuth() {
    const auth = sessionStorage.getItem('admin_auth');
    const sessionStart = parseInt(sessionStorage.getItem('session_start') || '0');
    const clientIP = sessionStorage.getItem('client_ip');
    const currentIP = getClientIP();
    
    // Check IP restriction
    if (localStorage.getItem('ip_restriction') === 'true' && clientIP !== currentIP) {
        sessionStorage.clear();
        return;
    }
    
    // Check session expiry
    const sessionDuration = parseInt(localStorage.getItem('session_timeout') || '3600') * 1000;
    
    if (auth === 'true' && (Date.now() - sessionStart) < sessionDuration) {
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    
    SessionManager.start();
    initDashboard();
}

// ========================================
// DASHBOARD INITIALIZATION
// ========================================
let salesChart, categoryChart;

function initDashboard() {
    updateStats();
    initCharts();
    renderRecentOrders();
    renderProductsTable();
    renderOrdersTable();
    renderTestimonials();
    renderCustomers();
    loadSettings();
    setupEventListeners();
}

function setupEventListeners() {
    // Menu toggle for mobile
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('sidebar').classList.toggle('mobile-open');
    });
    
    // Nav items - FIXED: Use click handler with proper preventDefault
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
            }
            // Close mobile sidebar after click
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('mobile-open');
            }
        });
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProductsByCategory(this.dataset.filter);
        });
    });
}

function showSection(sectionName) {
    if (!sectionName) return;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        products: 'Produk & Stok',
        orders: 'Pesanan',
        testimonials: 'Testimoni',
        customers: 'Pelanggan',
        settings: 'Pengaturan'
    };
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle && titles[sectionName]) {
        pageTitle.textContent = titles[sectionName];
    }
    
    // Re-render content based on section
    switch(sectionName) {
        case 'products':
            renderProductsTable();
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'testimonials':
            renderTestimonials();
            break;
        case 'customers':
            renderCustomers();
            break;
    }
}

// ========================================
// STATS & CHARTS
// ========================================
function updateStats() {
    const products = ProductManager.getAll();
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const visitors = parseInt(localStorage.getItem('total_visits') || '0');
    
    const revenue = salesHistory.reduce((total, sale) => total + (sale.price * sale.quantity), 0);
    const lowStock = products.filter(p => p.category !== 'other' && p.stock <= 5).length;
    
    document.getElementById('total-revenue').textContent = Utils.formatRupiah(revenue);
    document.getElementById('total-orders').textContent = salesHistory.length;
    document.getElementById('total-visitors').textContent = visitors.toLocaleString('id-ID');
    document.getElementById('total-products').textContent = products.length;
    
    const lowStockEl = document.getElementById('low-stock-count');
    const stockAlert = document.getElementById('stock-alert');
    const lowStockBadge = document.getElementById('low-stock-badge');
    
    if (lowStockEl) lowStockEl.textContent = lowStock;
    if (stockAlert) stockAlert.style.display = lowStock > 0 ? 'flex' : 'none';
    if (lowStockBadge) {
        lowStockBadge.textContent = lowStock;
        lowStockBadge.style.display = lowStock > 0 ? 'flex' : 'none';
    }
}

function initCharts() {
    const salesCtx = document.getElementById('salesChart');
    const categoryCtx = document.getElementById('categoryChart');
    
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: getSalesData(7),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#a1a1aa',
                            callback: v => 'Rp ' + v.toLocaleString('id-ID')
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a1a1aa' }
                    }
                }
            }
        });
    }
    
    if (categoryCtx) {
        const catData = getCategoryData();
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['VPS', 'Panel', 'Jasa'],
                datasets: [{
                    data: [catData.vps, catData.panel, catData.other],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a1a1aa', padding: 20 }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

function getSalesData(days) {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const labels = [];
    const values = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
        
        const daySales = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0];
            return saleDate === dateStr;
        });
        
        values.push(daySales.reduce((sum, s) => sum + (s.price * s.quantity), 0));
    }
    
    return { labels, datasets: [{ data: values, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4 }] };
}

function getCategoryData() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const products = ProductManager.getAll();
    
    let vps = 0, panel = 0, other = 0;
    
    salesHistory.forEach(sale => {
        const product = products.find(p => p.id === sale.id);
        if (product) {
            if (product.category === 'vps') vps += sale.quantity;
            else if (product.category === 'panel') panel += sale.quantity;
            else other += sale.quantity;
        }
    });
    
    return { vps, panel, other };
}

function updateSalesChart() {
    const days = parseInt(document.getElementById('sales-period').value);
    if (salesChart) {
        salesChart.data = getSalesData(days);
        salesChart.update();
    }
}

function renderRecentOrders() {
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;
    
    const orders = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const recentOrders = orders.slice(-5).reverse();
    
    tbody.innerHTML = recentOrders.map((order, index) => `
        <tr>
            <td><code class="order-id">${order.orderId || 'ORD-' + index}</code></td>
            <td>${order.name || order.service}</td>
            <td>${Utils.formatRupiah(order.price * order.quantity)}</td>
            <td><span class="status-badge ${order.status || 'completed'}">${order.status === 'completed' ? 'Selesai' : order.status === 'pending' ? 'Pending' : 'Dibatalkan'}</span></td>
            <td>${new Date(order.date).toLocaleDateString('id-ID')}</td>
        </tr>
    `).join('');
}

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
let currentProductFilter = 'all';

function renderProductsTable(filter = '') {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    let products = ProductManager.getAll();
    
    if (currentProductFilter !== 'all') {
        products = products.filter(p => p.category === currentProductFilter);
    }
    
    if (filter) {
        const q = filter.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q));
    }
    
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    
    tbody.innerHTML = products.map(product => {
        const sold = salesHistory.filter(s => s.id === product.id).reduce((sum, s) => sum + s.quantity, 0);
        const stockClass = product.category === 'other' ? 'unlimited' :
            product.stock > 10 ? 'high' : product.stock > 5 ? 'medium' : 'low';
        
        const categoryLabels = { vps: 'VPS', panel: 'Panel', other: 'Jasa' };
        
        return `
            <tr>
                <td><strong>${product.name}</strong> ${product.recommend ? '<span class="badge badge-warning">★</span>' : ''}</td>
                <td><span class="category-badge ${product.category}">${categoryLabels[product.category]}</span></td>
                <td>${Utils.formatRupiah(product.price)}</td>
                <td><span class="stock-badge ${stockClass}">${product.category === 'other' ? '∞' : product.stock}</span></td>
                <td><span class="status-badge ${product.category === 'other' || product.stock > 0 ? 'active' : 'inactive'}">${product.category === 'other' || product.stock > 0 ? 'Aktif' : 'Habis'}</span></td>
                <td>${sold}</td>
                <td>
                    <div class="action-btns">
                        ${product.category !== 'other' ? `<button class="action-btn restock" onclick="openRestockModal('${product.id}')" title="Restock"><i class="fas fa-plus"></i></button>` : ''}
                        <button class="action-btn edit" onclick="editProduct('${product.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterProducts() {
    const query = document.getElementById('product-search').value;
    renderProductsTable(query);
}

function filterProductsByCategory(category) {
    currentProductFilter = category;
    renderProductsTable();
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    
    if (productId) {
        const product = ProductManager.getById(productId);
        if (!product) return;
        
        title.textContent = 'Edit Produk';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-desc').value = product.desc || '';
        document.getElementById('product-features').value = product.features?.join('\n') || '';
        document.getElementById('product-recommend').checked = product.recommend || false;
    } else {
        title.textContent = 'Tambah Produk';
        document.getElementById('product-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-category').value = 'vps';
        document.getElementById('product-price').value = '';
        document.getElementById('product-stock').value = '10';
        document.getElementById('product-desc').value = '';
        document.getElementById('product-features').value = '';
        document.getElementById('product-recommend').checked = false;
    }
    
    toggleStockField();
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function toggleStockField() {
    const category = document.getElementById('product-category').value;
    document.getElementById('stock-field').style.display = category === 'other' ? 'none' : 'block';
}

function saveProduct() {
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseInt(document.getElementById('product-price').value);
    const stock = category === 'other' ? 999 : parseInt(document.getElementById('product-stock').value);
    const desc = document.getElementById('product-desc').value.trim();
    const features = document.getElementById('product-features').value.split('\n').filter(f => f.trim());
    const recommend = document.getElementById('product-recommend').checked;
    
    if (!name || !price) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Nama dan harga harus diisi!', background: '#1a1a2e', color: '#fff' });
        return;
    }
    
    const productData = { name, category, price, stock, desc, features, recommend };
    
    if (id) {
        ProductManager.updateProduct(id, productData);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Produk diperbarui!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
    } else {
        ProductManager.addProduct(productData);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Produk ditambahkan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
    }
    
    closeProductModal();
    renderProductsTable();
    updateStats();
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    Swal.fire({
        title: 'Hapus Produk?',
        text: 'Produk akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            ProductManager.deleteProduct(productId);
            renderProductsTable();
            updateStats();
            Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Produk berhasil dihapus!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

function resetProducts() {
    Swal.fire({
        title: 'Reset Produk?',
        text: 'Semua produk akan direset ke default!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('products');
            ProductManager.init();
            renderProductsTable();
            updateStats();
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Produk direset!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

// ========================================
// RESTOCK
// ========================================
function openRestockModal(productId) {
    const product = ProductManager.getById(productId);
    if (!product) return;
    
    document.getElementById('restock-product-id').value = productId;
    document.getElementById('restock-product-name').textContent = product.name;
    document.getElementById('restock-current-stock').textContent = product.stock;
    document.getElementById('restock-amount').value = '';
    
    document.getElementById('restock-modal').classList.add('active');
}

function closeRestockModal() {
    document.getElementById('restock-modal').classList.remove('active');
}

function confirmRestock() {
    const productId = document.getElementById('restock-product-id').value;
    const amount = parseInt(document.getElementById('restock-amount').value);
    
    if (!amount || amount <= 0) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Jumlah tidak valid!', background: '#1a1a2e', color: '#fff' });
        return;
    }
    
    ProductManager.restock(productId, amount);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: `Stok ditambahkan!`, background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
    
    closeRestockModal();
    renderProductsTable();
    updateStats();
}

// ========================================
// ORDERS
// ========================================
function renderOrdersTable(filter = 'all') {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    let orders = JSON.parse(localStorage.getItem('salesHistory')) || [];
    if (filter !== 'all') orders = orders.filter(o => o.status === filter);
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td><code class="order-id">${order.orderId || 'ORD-' + index}</code></td>
            <td>-</td>
            <td>${order.name || order.service}</td>
            <td>${order.quantity}</td>
            <td>${Utils.formatRupiah(order.price * order.quantity)}</td>
            <td><span class="status-badge ${order.status || 'completed'}">${order.status === 'completed' ? 'Selesai' : order.status === 'pending' ? 'Pending' : 'Dibatalkan'}</span></td>
            <td>${new Date(order.date).toLocaleDateString('id-ID')}</td>
            <td><button class="action-btn delete" onclick="deleteOrder(${index})" title="Hapus"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function filterOrders() {
    const filter = document.getElementById('order-filter').value;
    renderOrdersTable(filter);
}

function deleteOrder(index) {
    Swal.fire({
        title: 'Hapus Pesanan?',
        text: 'Pesanan akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            const orders = JSON.parse(localStorage.getItem('salesHistory')) || [];
            orders.splice(index, 1);
            localStorage.setItem('salesHistory', JSON.stringify(orders));
            renderOrdersTable();
            renderRecentOrders();
            updateStats();
            Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Pesanan berhasil dihapus!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

function clearAllOrders() {
    Swal.fire({
        title: 'Hapus Semua Pesanan?',
        text: 'Semua riwayat pesanan akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus Semua',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('salesHistory');
            renderOrdersTable();
            renderRecentOrders();
            updateStats();
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Semua pesanan dihapus!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

// ========================================
// TESTIMONIALS (SUPER FIX VISUAL BINTANG KOSONG)
// ========================================
function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    
    const testimonials = TestimonialManager.getAll().slice().reverse();
    
    grid.innerHTML = testimonials.map((t, index) => {
        // PERBAIKAN DI SINI:
        // 'fas' untuk bintang penuh kuning
        // 'far' untuk bintang kosong abu-abu
        const stars = Array(5).fill(0).map((_, i) => 
            `<i class="${i < t.rating ? 'fas' : 'far'} fa-star" style="color: ${i < t.rating ? 'var(--warning)' : '#4b5563'};"></i>`
        ).join('');
        
        const initials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        return `
            <div class="testimonial-admin-card">
                <div class="testimonial-admin-header">
                    <div class="testimonial-avatar">${initials}</div>
                    <div>
                        <h4>${t.name}</h4>
                        <div class="testimonial-rating">${stars}</div>
                    </div>
                </div>
                <p class="testimonial-text">${t.message}</p>
                <div class="testimonial-footer">
                    <span>${Utils.formatDate(t.date)}</span>
                    <button class="action-btn delete" onclick="deleteTestimonial(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function filterTestimonials() {
    const query = document.getElementById('testi-search').value.toLowerCase();
    const cards = document.querySelectorAll('.testimonial-admin-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

function deleteTestimonial(index) {
    Swal.fire({
        title: 'Hapus Testimoni?',
        text: 'Testimoni akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            const testimonials = TestimonialManager.getAll();
            testimonials.splice(index, 1);
            localStorage.setItem('testimonials', JSON.stringify(testimonials));
            renderTestimonials();
            Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Testimoni berhasil dihapus!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

// ========================================
// CUSTOMERS
// ========================================
function renderCustomers() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const testimonials = TestimonialManager.getAll();
    
    // Aggregate customer data
    const customers = {};
    salesHistory.forEach(sale => {
        const custName = sale.name || '-';
        if (!customers[custName]) {
            customers[custName] = { orders: 0, spent: 0, lastOrder: sale.date };
        }
        customers[custName].orders++;
        customers[custName].spent += sale.price * sale.quantity;
        if (new Date(sale.date) > new Date(customers[custName].lastOrder)) {
            customers[custName].lastOrder = sale.date;
        }
    });
    
    const customerList = Object.entries(customers).map(([name, data]) => ({
        name,
        ...data,
        rating: testimonials.find(t => t.name === name)?.rating || 0
    }));
    
    document.getElementById('total-customers').textContent = customerList.length;
    document.getElementById('active-customers').textContent = customerList.filter(c => c.orders > 1).length;
    document.getElementById('avg-rating').textContent = (testimonials.reduce((sum, t) => sum + t.rating, 0) / (testimonials.length || 1)).toFixed(1);
    
    tbody.innerHTML = customerList.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.orders}</td>
            <td>${Utils.formatRupiah(c.spent)}</td>
            <td>${c.rating > 0 ? '<i class="fas fa-star" style="color: var(--warning);"></i> ' + c.rating : '-'}</td>
            <td>${Utils.formatDate(c.lastOrder)}</td>
        </tr>
    `).join('');
}

// ========================================
// SETTINGS
// ========================================
function loadSettings() {
    document.getElementById('pakasir-slug').value = localStorage.getItem('pakasir_slug') || '';
    document.getElementById('pakasir-apikey').value = localStorage.getItem('pakasir_apikey') || '';
    document.getElementById('openai-apikey').value = localStorage.getItem('openai_apikey') || '';
    document.getElementById('openai-model').value = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
    document.getElementById('ptero-url').value = localStorage.getItem('ptero_url') || '';
    document.getElementById('ptero-ptla').value = localStorage.getItem('ptero_ptla') || '';
    document.getElementById('ptero-ptlc').value = localStorage.getItem('ptero_ptlc') || '';
    document.getElementById('session-timeout').value = localStorage.getItem('session_timeout') || '3600';
    document.getElementById('max-attempts').value = localStorage.getItem('max_attempts') || '5';
    document.getElementById('ip-restriction').checked = localStorage.getItem('ip_restriction') !== 'false';
}

function savePakasirSettings() {
    localStorage.setItem('pakasir_slug', document.getElementById('pakasir-slug').value.trim());
    localStorage.setItem('pakasir_apikey', document.getElementById('pakasir-apikey').value.trim());
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pengaturan Pakasir disimpan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
}

function saveOpenAISettings() {
    localStorage.setItem('openai_apikey', document.getElementById('openai-apikey').value.trim());
    localStorage.setItem('openai_model', document.getElementById('openai-model').value);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pengaturan OpenAI disimpan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
}

function savePteroSettings() {
    localStorage.setItem('ptero_url', document.getElementById('ptero-url').value.trim());
    localStorage.setItem('ptero_ptla', document.getElementById('ptero-ptla').value.trim());
    localStorage.setItem('ptero_ptlc', document.getElementById('ptero-ptlc').value.trim());
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pengaturan Pterodactyl disimpan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
}

async function testPteroConnection() {
    const url = document.getElementById('ptero-url').value.trim();
    const ptla = document.getElementById('ptero-ptla').value.trim();
    
    if (!url || !ptla) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'URL dan PTLA harus diisi!', background: '#1a1a2e', color: '#fff' });
        return;
    }
    
    Swal.fire({
        title: 'Testing...',
        text: 'Menghubungkan ke Pterodactyl...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    
    try {
        const response = await fetch(`${url}/api/application/users`, {
            headers: { 'Authorization': `Bearer ${ptla}`, 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Koneksi ke Pterodactyl berhasil!', background: '#1a1a2e', color: '#fff' });
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat terhubung ke Pterodactyl. Periksa URL dan API key.', background: '#1a1a2e', color: '#fff' });
    }
}

function saveSecuritySettings() {
    localStorage.setItem('session_timeout', document.getElementById('session-timeout').value);
    localStorage.setItem('max_attempts', document.getElementById('max-attempts').value);
    localStorage.setItem('ip_restriction', document.getElementById('ip-restriction').checked);
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pengaturan keamanan disimpan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
}

function toggleInputPassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function resetAllData() {
    Swal.fire({
        title: 'Reset Semua Data?',
        text: 'Semua data akan direset ke default!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset Semua',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('products');
            localStorage.removeItem('salesHistory');
            localStorage.removeItem('testimonials');
            localStorage.removeItem('cart');
            ProductManager.init();
            TestimonialManager.init();
            initDashboard();
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Semua data direset!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    });
}

function clearCache() {
    const essential = ['products', 'salesHistory', 'testimonials', 'pakasir_slug', 'pakasir_apikey'];
    const keys = Object.keys(localStorage).filter(k => !essential.includes(k));
    keys.forEach(k => localStorage.removeItem(k));
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Cache dibersihkan!', background: '#1a1a2e', color: '#fff', timer: 1500, showConfirmButton: false });
}

function exportProducts() {
    const products = ProductManager.getAll();
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-backup.json';
    a.click();
}

function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('salesHistory')) || [];
    const dataStr = JSON.stringify(orders, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders-backup.json';
    a.click();
}

function exportCustomers() {
    Swal.fire({ icon: 'info', title: 'Info', text: 'Fitur export customers akan segera hadir!', background: '#1a1a2e', color: '#fff' });
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Expose functions globally
window.showSection = showSection;
window.login = login;
window.logout = logout;
window.togglePassword = togglePassword;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.resetProducts = resetProducts;
window.filterProducts = filterProducts;
window.openRestockModal = openRestockModal;
window.closeRestockModal = closeRestockModal;
window.confirmRestock = confirmRestock;
window.filterOrders = filterOrders;
window.deleteOrder = deleteOrder;
window.clearAllOrders = clearAllOrders;
window.filterTestimonials = filterTestimonials;
window.deleteTestimonial = deleteTestimonial;
window.savePakasirSettings = savePakasirSettings;
window.saveOpenAISettings = saveOpenAISettings;
window.savePteroSettings = savePteroSettings;
window.testPteroConnection = testPteroConnection;
window.saveSecuritySettings = saveSecuritySettings;
window.toggleInputPassword = toggleInputPassword;
window.resetAllData = resetAllData;
window.clearCache = clearCache;
window.exportProducts = exportProducts;
window.exportOrders = exportOrders;
window.exportCustomers = exportCustomers;
window.updateSalesChart = updateSalesChart;indow.updateSalesChart = updateSalesChart;
