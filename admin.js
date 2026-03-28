/**
 * ALFA HOSTING - Admin Panel JavaScript
 * MongoDB Backend Version with Enhanced Security
 */

// ========================================
// API CONFIGURATION
// ========================================
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';

// ========================================
// SECURITY CONFIGURATION
// ========================================
const SECURITY = {
    SESSION_DURATION: 60 * 60 * 1000, // 1 hour
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// ========================================
// API HELPER
// ========================================
const api = {
    async call(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = sessionStorage.getItem('admin_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();
            
            // Handle token expiration
            if (response.status === 401 && token) {
                sessionStorage.clear();
                showLoginOverlay();
                return { success: false, message: 'Sesi telah berakhir.' };
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Terjadi kesalahan koneksi.' };
        }
    }
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

function generateFingerprint() {
    const fp = navigator.userAgent + navigator.language + screen.width + screen.height;
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
        const char = fp.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// ========================================
// SESSION MANAGEMENT
// ========================================
const SessionManager = {
    timer: null,
    refreshTimer: null,
    remaining: 60 * 60, // seconds

    start() {
        const sessionTimeout = parseInt(localStorage.getItem('session_timeout')) || 3600;
        this.remaining = sessionTimeout;
        this.updateDisplay();
        
        // Main session timer
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
        
        // Token refresh timer
        this.refreshTimer = setInterval(() => {
            this.refreshToken();
        }, SECURITY.TOKEN_REFRESH_INTERVAL);
    },

    updateDisplay() {
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        const display = document.getElementById('session-timer');
        if (display) {
            display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    },

    async extend() {
        const sessionTimeout = parseInt(localStorage.getItem('session_timeout')) || 3600;
        this.remaining = sessionTimeout;
        sessionStorage.setItem('session_start', Date.now().toString());
        await this.refreshToken();
    },

    async refreshToken() {
        const refreshToken = sessionStorage.getItem('admin_refresh_token');
        if (!refreshToken) return;
        
        const response = await api.call('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
        
        if (response.success) {
            sessionStorage.setItem('admin_token', response.data.token);
        }
    },

    expire() {
        this.stop();
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
        clearInterval(this.refreshTimer);
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
    
    // Reset error display
    errorEl.classList.remove('show');
    
    if (!username || !password) {
        showLoginError('Username dan password harus diisi!');
        return;
    }
    
    // Show loading
    const loginBtn = document.querySelector('.login-form .btn-primary');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
    loginBtn.disabled = true;
    
    try {
        const response = await api.call('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.success) {
            // Store tokens securely
            sessionStorage.setItem('admin_token', response.data.token);
            sessionStorage.setItem('admin_refresh_token', response.data.refreshToken);
            sessionStorage.setItem('session_start', Date.now().toString());
            sessionStorage.setItem('client_fingerprint', generateFingerprint());
            
            // Store user info
            localStorage.setItem('admin_username', response.data.user.username);
            localStorage.setItem('admin_role', response.data.user.role);
            
            showDashboard();
        } else {
            // Show error
            showLoginError(response.message || 'Username atau password salah!');
            
            // Update attempts display
            const attempts = parseInt(localStorage.getItem('login_attempts') || '0') + 1;
            localStorage.setItem('login_attempts', attempts);
            
            if (attemptsEl) {
                const remaining = SECURITY.MAX_LOGIN_ATTEMPTS - attempts;
                attemptsEl.querySelector('span').textContent = Math.max(0, remaining);
                attemptsEl.style.display = 'block';
            }
            
            // Shake animation
            const loginBox = document.querySelector('.login-box');
            loginBox.style.animation = 'shake 0.5s';
            setTimeout(() => loginBox.style.animation = '', 500);
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Terjadi kesalahan saat login.');
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('login-error');
    errorEl.querySelector('span').textContent = message;
    errorEl.classList.add('show');
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

async function logout() {
    // Call logout API
    await api.call('/auth/logout', { method: 'POST' });
    
    SessionManager.stop();
    sessionStorage.clear();
    location.reload();
}

async function checkAuth() {
    const token = sessionStorage.getItem('admin_token');
    
    if (!token) {
        showLoginOverlay();
        return;
    }
    
    // Verify token with server
    const response = await api.call('/auth/check');
    
    if (response.success && response.data.isAuthenticated) {
        showDashboard();
    } else {
        sessionStorage.clear();
        showLoginOverlay();
    }
}

function showLoginOverlay() {
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
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

async function initDashboard() {
    await updateStats();
    await initCharts();
    await renderRecentOrders();
    await renderProductsTable();
    await renderOrdersTable();
    await renderTestimonials();
    await renderCustomers();
    loadSettings();
    setupEventListeners();
}

function setupEventListeners() {
    // Menu toggle for mobile
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('sidebar').classList.toggle('mobile-open');
    });
    
    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
            }
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
async function updateStats() {
    const response = await api.call('/dashboard/stats');
    
    if (!response.success) return;
    
    const data = response.data;
    
    document.getElementById('total-revenue').textContent = Utils.formatRupiah(data.orders.totalRevenue);
    document.getElementById('total-orders').textContent = data.orders.total;
    document.getElementById('total-visitors').textContent = '2,500'; // Placeholder
    document.getElementById('total-products').textContent = data.products.total;
    
    const lowStockEl = document.getElementById('low-stock-count');
    const stockAlert = document.getElementById('stock-alert');
    const lowStockBadge = document.getElementById('low-stock-badge');
    
    if (lowStockEl) lowStockEl.textContent = data.products.lowStock;
    if (stockAlert) stockAlert.style.display = data.products.lowStock > 0 ? 'flex' : 'none';
    if (lowStockBadge) {
        lowStockBadge.textContent = data.products.lowStock;
        lowStockBadge.style.display = data.products.lowStock > 0 ? 'flex' : 'none';
    }
}

async function initCharts() {
    const response = await api.call('/orders/sales-data?days=7');
    
    if (!response.success) return;
    
    const salesData = response.data.sales;
    const categoryData = response.data.categories;
    
    const salesCtx = document.getElementById('salesChart');
    const categoryCtx = document.getElementById('categoryChart');
    
    if (salesCtx) {
        const labels = Object.keys(salesData).map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        });
        const values = Object.values(salesData);
        
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: values,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
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
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['VPS', 'Panel', 'Jasa'],
                datasets: [{
                    data: [categoryData.vps, categoryData.panel, categoryData.other],
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

async function updateSalesChart() {
    const days = parseInt(document.getElementById('sales-period').value);
    const response = await api.call(`/orders/sales-data?days=${days}`);
    
    if (!response.success) return;
    
    const salesData = response.data.sales;
    const labels = Object.keys(salesData).map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    });
    const values = Object.values(salesData);
    
    if (salesChart) {
        salesChart.data.labels = labels;
        salesChart.data.datasets[0].data = values;
        salesChart.update();
    }
}

async function renderRecentOrders() {
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;
    
    const response = await api.call('/orders/recent?limit=5');
    
    if (!response.success) return;
    
    const orders = response.data;
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td><code class="order-id">${order.orderId}</code></td>
            <td>${order.items?.[0]?.name || '-'}</td>
            <td>${Utils.formatRupiah(order.total)}</td>
            <td><span class="status-badge ${order.status}">${order.status === 'completed' ? 'Selesai' : order.status === 'pending' ? 'Pending' : 'Dibatalkan'}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
        </tr>
    `).join('');
}

// ========================================
// PRODUCTS MANAGEMENT
// ========================================
let currentProductFilter = 'all';

async function renderProductsTable(filter = '') {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    const response = await api.call('/products');
    
    if (!response.success) return;
    
    let products = response.data;
    
    if (currentProductFilter !== 'all') {
        products = products.filter(p => p.category === currentProductFilter);
    }
    
    if (filter) {
        const q = filter.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q));
    }
    
    tbody.innerHTML = products.map(product => {
        const stockClass = product.category === 'other' ? 'unlimited' :
            product.stock > 10 ? 'high' : product.stock > 5 ? 'medium' : 'low';
        
        const categoryLabels = { vps: 'VPS', panel: 'Panel', other: 'Jasa' };
        
        return `
            <tr>
                <td><strong>${product.name}</strong> ${product.recommend ? '<span class="badge badge-warning">★</span>' : ''}</td>
                <td><span class="category-badge ${product.category}">${categoryLabels[product.category]}</span></td>
                <td>${Utils.formatRupiah(product.price)}</td>
                <td><span class="stock-badge ${stockClass}">${product.category === 'other' ? '∞' : product.stock}</span></td>
                <td><span class="status-badge ${product.isActive ? 'active' : 'inactive'}">${product.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                <td>${product.soldCount || 0}</td>
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

async function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    
    if (productId) {
        const response = await api.call(`/products/${productId}`);
        if (!response.success) return;
        
        const product = response.data;
        
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

async function saveProduct() {
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
    
    let response;
    if (id) {
        response = await api.call(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    } else {
        const newId = 'prod_' + Date.now().toString(36);
        response = await api.call('/products', {
            method: 'POST',
            body: JSON.stringify({ id: newId, ...productData })
        });
    }
    
    if (response.success) {
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil', 
            text: id ? 'Produk diperbarui!' : 'Produk ditambahkan!', 
            background: '#1a1a2e', 
            color: '#fff', 
            timer: 1500, 
            showConfirmButton: false 
        });
        closeProductModal();
        renderProductsTable();
        updateStats();
    } else {
        Swal.fire({ 
            icon: 'error', 
            title: 'Error', 
            text: response.message, 
            background: '#1a1a2e', 
            color: '#fff' 
        });
    }
}

async function editProduct(productId) {
    await openProductModal(productId);
}

async function deleteProduct(productId) {
    const result = await Swal.fire({
        title: 'Hapus Produk?',
        text: 'Produk akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        const response = await api.call(`/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            renderProductsTable();
            updateStats();
            Swal.fire({ 
                icon: 'success', 
                title: 'Terhapus', 
                text: 'Produk berhasil dihapus!', 
                background: '#1a1a2e', 
                color: '#fff', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }
}

async function resetProducts() {
    const result = await Swal.fire({
        title: 'Reset Produk?',
        text: 'Semua produk akan direset ke default!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        const response = await api.call('/products/reset', {
            method: 'POST'
        });
        
        if (response.success) {
            renderProductsTable();
            updateStats();
            Swal.fire({ 
                icon: 'success', 
                title: 'Berhasil', 
                text: 'Produk direset!', 
                background: '#1a1a2e', 
                color: '#fff', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }
}

function exportProducts() {
    Swal.fire({
        icon: 'info',
        title: 'Export Produk',
        text: 'Fitur export akan segera hadir!',
        background: '#1a1a2e',
        color: '#fff'
    });
}

// ========================================
// RESTOCK
// ========================================
async function openRestockModal(productId) {
    const response = await api.call(`/products/${productId}`);
    if (!response.success) return;
    
    const product = response.data;
    
    document.getElementById('restock-product-id').value = productId;
    document.getElementById('restock-product-name').textContent = product.name;
    document.getElementById('restock-current-stock').textContent = product.stock;
    document.getElementById('restock-amount').value = '';
    
    document.getElementById('restock-modal').classList.add('active');
}

function closeRestockModal() {
    document.getElementById('restock-modal').classList.remove('active');
}

async function confirmRestock() {
    const productId = document.getElementById('restock-product-id').value;
    const amount = parseInt(document.getElementById('restock-amount').value);
    
    if (!amount || amount <= 0) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Jumlah tidak valid!', background: '#1a1a2e', color: '#fff' });
        return;
    }
    
    const response = await api.call(`/products/${productId}/restock`, {
        method: 'POST',
        body: JSON.stringify({ amount })
    });
    
    if (response.success) {
        Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil', 
            text: `Stok ditambahkan!`, 
            background: '#1a1a2e', 
            color: '#fff', 
            timer: 1500, 
            showConfirmButton: false 
        });
        
        closeRestockModal();
        renderProductsTable();
        updateStats();
    }
}

// ========================================
// ORDERS
// ========================================
async function renderOrdersTable(filter = 'all') {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    const response = await api.call(`/orders?status=${filter}`);
    
    if (!response.success) return;
    
    const orders = response.data;
    
    tbody.innerHTML = orders.map((order, index) => `
        <tr>
            <td><code class="order-id">${order.orderId}</code></td>
            <td>${order.customerInfo?.name || '-'}</td>
            <td>${order.items?.[0]?.name || '-'}</td>
            <td>${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
            <td>${Utils.formatRupiah(order.total)}</td>
            <td><span class="status-badge ${order.status}">${order.status === 'completed' ? 'Selesai' : order.status === 'pending' ? 'Pending' : 'Dibatalkan'}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
            <td><button class="action-btn delete" onclick="deleteOrder('${order.orderId}')" title="Hapus"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function filterOrders() {
    const filter = document.getElementById('order-filter').value;
    renderOrdersTable(filter);
}

async function deleteOrder(orderId) {
    const result = await Swal.fire({
        title: 'Hapus Pesanan?',
        text: 'Pesanan akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        const response = await api.call(`/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            renderOrdersTable();
            renderRecentOrders();
            updateStats();
            Swal.fire({ 
                icon: 'success', 
                title: 'Terhapus', 
                text: 'Pesanan berhasil dihapus!', 
                background: '#1a1a2e', 
                color: '#fff', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }
}

async function clearAllOrders() {
    const result = await Swal.fire({
        title: 'Hapus Semua Pesanan?',
        text: 'Semua riwayat pesanan akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus Semua',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        const response = await api.call('/orders', {
            method: 'DELETE'
        });
        
        if (response.success) {
            renderOrdersTable();
            renderRecentOrders();
            updateStats();
            Swal.fire({ 
                icon: 'success', 
                title: 'Berhasil', 
                text: 'Semua pesanan dihapus!', 
                background: '#1a1a2e', 
                color: '#fff', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }
}

function exportOrders() {
    Swal.fire({
        icon: 'info',
        title: 'Export Pesanan',
        text: 'Fitur export akan segera hadir!',
        background: '#1a1a2e',
        color: '#fff'
    });
}

// ========================================
// TESTIMONIALS
// ========================================
async function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    
    const response = await api.call('/testimonials/all');
    
    if (!response.success) return;
    
    const testimonials = response.data;
    
    grid.innerHTML = testimonials.map((t, index) => {
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
                    <span>${Utils.formatDate(t.createdAt)}</span>
                    <button class="action-btn delete" onclick="deleteTestimonial('${t._id}')"><i class="fas fa-trash"></i></button>
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

async function deleteTestimonial(id) {
    const result = await Swal.fire({
        title: 'Hapus Testimoni?',
        text: 'Testimoni akan dihapus!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
        const response = await api.call(`/testimonials/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            renderTestimonials();
            Swal.fire({ 
                icon: 'success', 
                title: 'Terhapus', 
                text: 'Testimoni berhasil dihapus!', 
                background: '#1a1a2e', 
                color: '#fff', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }
}

// ========================================
// CUSTOMERS
// ========================================
async function renderCustomers() {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    
    const response = await api.call('/orders');
    const testiResponse = await api.call('/testimonials/all');
    
    if (!response.success) return;
    
    const orders = response.data;
    const testimonials = testiResponse.success ? testiResponse.data : [];
    
    // Aggregate customer data
    const customers = {};
    orders.forEach(order => {
        const custName = order.customerInfo?.name || '-';
        if (!customers[custName]) {
            customers[custName] = { orders: 0, spent: 0, lastOrder: order.createdAt };
        }
        customers[custName].orders++;
        customers[custName].spent += order.total;
        if (new Date(order.createdAt) > new Date(customers[custName].lastOrder)) {
            customers[custName].lastOrder = order.createdAt;
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

function exportCustomers() {
    Swal.fire({
        icon: 'info',
        title: 'Export Pelanggan',
        text: 'Fitur export akan segera hadir!',
        background: '#1a1a2e',
        color: '#fff'
    });
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
    const btn = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        btn.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function resetAllData() {
    Swal.fire({
        title: 'Reset Semua Data?',
        text: 'Semua data akan direset ke default!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Semua data telah direset!',
                background: '#1a1a2e',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function clearCache() {
    localStorage.clear();
    sessionStorage.clear();
    Swal.fire({
        icon: 'success',
        title: 'Cache Dibersihkan',
        text: 'Cache berhasil dibersihkan!',
        background: '#1a1a2e',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
    });
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Expose functions to global scope
window.login = login;
window.logout = logout;
window.togglePassword = togglePassword;
window.showSection = showSection;
window.updateSalesChart = updateSalesChart;
window.filterProducts = filterProducts;
window.filterProductsByCategory = filterProductsByCategory;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.toggleStockField = toggleStockField;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.resetProducts = resetProducts;
window.exportProducts = exportProducts;
window.openRestockModal = openRestockModal;
window.closeRestockModal = closeRestockModal;
window.confirmRestock = confirmRestock;
window.filterOrders = filterOrders;
window.deleteOrder = deleteOrder;
window.clearAllOrders = clearAllOrders;
window.exportOrders = exportOrders;
window.filterTestimonials = filterTestimonials;
window.deleteTestimonial = deleteTestimonial;
window.exportCustomers = exportCustomers;
window.savePakasirSettings = savePakasirSettings;
window.saveOpenAISettings = saveOpenAISettings;
window.savePteroSettings = savePteroSettings;
window.testPteroConnection = testPteroConnection;
window.saveSecuritySettings = saveSecuritySettings;
window.toggleInputPassword = toggleInputPassword;
window.resetAllData = resetAllData;
window.clearCache = clearCache;
