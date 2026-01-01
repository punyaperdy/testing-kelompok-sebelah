// Aplikasi Manajemen Keuangan
class FinancialManager {
    constructor() {
        this.incomeRecords = this.loadFromStorage('incomeRecords') || [];
        this.expenseRecords = this.loadFromStorage('expenseRecords') || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.updateDashboard();
        this.displayRecords();
        this.setupFilters();
        this.setupModalEventListeners();
    }

    setupEventListeners() {
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });
    }

    setupModalEventListeners() {
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModal(event.target.id);
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => this.closeModal(modal.id));
            }
        });

        // Set default dates when modals open
        document.getElementById('incomeModal').addEventListener('show', () => {
            this.setDefaultIncomeDate();
        });

        document.getElementById('expenseModal').addEventListener('show', () => {
            this.setDefaultExpenseDate();
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        this.setDefaultIncomeDate();
        this.setDefaultExpenseDate();
    }

    setDefaultIncomeDate() {
        const today = new Date().toISOString().split('T')[0];
        const incomeDateInput = document.getElementById('income-date');
        if (incomeDateInput) {
            incomeDateInput.value = today;
        }
    }

    setDefaultExpenseDate() {
        const today = new Date().toISOString().split('T')[0];
        const expenseDateInput = document.getElementById('expense-date');
        if (expenseDateInput) {
            expenseDateInput.value = today;
        }
    }

    formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Modal functions
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Reset form
            const form = modal.querySelector('form');
            if (form) form.reset();
            
            // Set default date
            if (modalId === 'incomeModal') {
                this.setDefaultIncomeDate();
            } else if (modalId === 'expenseModal') {
                this.setDefaultExpenseDate();
            }
            
            // Show modal with animation
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    addIncome() {
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;
        const date = document.getElementById('income-date').value;

        if (!amount || !category || !date) {
            this.showNotification('Silakan isi semua kolom', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Jumlah harus lebih dari 0', 'error');
            return;
        }

        const record = {
            id: Date.now(),
            amount: amount,
            category: category,
            date: date,
            timestamp: new Date().toISOString()
        };

        this.incomeRecords.unshift(record);
        this.saveToStorage('incomeRecords', this.incomeRecords);
        this.updateDashboard();
        this.displayRecords();
        this.closeModal('incomeModal');
        this.showNotification('Pemasukan berhasil ditambahkan!', 'success');
    }

    addExpense() {
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (!amount || !category || !date) {
            this.showNotification('Silakan isi semua kolom', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Jumlah harus lebih dari 0', 'error');
            return;
        }

        const record = {
            id: Date.now(),
            amount: amount,
            category: category,
            date: date,
            timestamp: new Date().toISOString()
        };

        this.expenseRecords.unshift(record);
        this.saveToStorage('expenseRecords', this.expenseRecords);
        this.updateDashboard();
        this.displayRecords();
        this.closeModal('expenseModal');
        this.showNotification('Pengeluaran berhasil ditambahkan!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateDashboard() {
        const totalIncome = this.incomeRecords.reduce((sum, record) => sum + record.amount, 0);
        const totalExpenses = this.expenseRecords.reduce((sum, record) => sum + record.amount, 0);
        const balance = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = this.formatRupiah(totalIncome);
        document.getElementById('total-expenses').textContent = this.formatRupiah(totalExpenses);
        document.getElementById('balance').textContent = this.formatRupiah(balance);

        // Animate number changes
        this.animateNumber('total-income', totalIncome);
        this.animateNumber('total-expenses', totalExpenses);
        this.animateNumber('balance', balance);

        // Ubah warna saldo berdasarkan positif/negatif
        const balanceElement = document.getElementById('balance');
        if (balance >= 0) {
            balanceElement.style.color = '#28a745';
        } else {
            balanceElement.style.color = '#dc3545';
        }
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const startTime = Date.now();
        const duration = 1000; // 1 second

        const formatValue = (value) => {
            if (elementId === 'balance') {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(value);
            }
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);
        };

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (targetValue - startValue) * easeOut;
            
            element.textContent = formatValue(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    setupFilters() {
        const filterType = document.getElementById('filter-type');
        const filterCategory = document.getElementById('filter-category');
        const filterDate = document.getElementById('filter-date');

        if (filterType) {
            filterType.addEventListener('change', () => this.displayRecords());
        }
        if (filterCategory) {
            filterCategory.addEventListener('change', () => this.displayRecords());
        }
        if (filterDate) {
            filterDate.addEventListener('change', () => this.displayRecords());
        }
    }

    getFilteredRecords() {
        const filterType = document.getElementById('filter-type').value;
        const filterCategory = document.getElementById('filter-category').value;
        const filterDate = document.getElementById('filter-date').value;

        // Gabungkan dan sortir semua transaksi
        let allRecords = [
            ...this.incomeRecords.map(record => ({ ...record, type: 'income' })),
            ...this.expenseRecords.map(record => ({ ...record, type: 'expense' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Filter berdasarkan tipe
        if (filterType && filterType !== 'all') {
            allRecords = allRecords.filter(record => record.type === filterType);
        }

        // Filter berdasarkan kategori
        if (filterCategory && filterCategory !== 'all') {
            allRecords = allRecords.filter(record => record.category === filterCategory);
        }

        // Filter berdasarkan tanggal
        if (filterDate) {
            allRecords = allRecords.filter(record => record.date === filterDate);
        }

        return allRecords;
    }

    displayRecords() {
        const recordsList = document.getElementById('records-list');
        
        if (this.incomeRecords.length === 0 && this.expenseRecords.length === 0) {
            recordsList.innerHTML = '<div class="no-records">Belum ada transaksi. Tambahkan pemasukan atau pengeluaran pertama Anda!</div>';
            return;
        }

        const filteredRecords = this.getFilteredRecords();

        if (filteredRecords.length === 0) {
            recordsList.innerHTML = '<div class="no-records">Tidak ada transaksi yang sesuai dengan filter yang dipilih.</div>';
            return;
        }

        // Buat tabel untuk menampilkan transaksi
        let tableHTML = `
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Jenis</th>
                        <th>Kategori</th>
                        <th>Jumlah</th>
                    </tr>
                </thead>
                <tbody>
        `;

        filteredRecords.forEach((record, index) => {
            const formattedDate = new Date(record.date).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const typeText = record.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
            const amountText = record.type === 'income' ? 
                `+${this.formatRupiah(record.amount)}` : 
                `-${this.formatRupiah(record.amount)}`;
            const amountClass = record.type === 'income' ? 'income' : 'expense';

            // Add animation delay for staggered effect
            tableHTML += `
                <tr class="record-item ${record.type}" style="animation-delay: ${index * 0.1}s;">
                    <td class="record-date">${formattedDate}</td>
                    <td class="record-type">${typeText}</td>
                    <td class="record-category">${record.category}</td>
                    <td class="record-amount ${amountClass}">${amountText}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        recordsList.innerHTML = tableHTML;
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error menyimpan data. Silakan coba lagi.', 'error');
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    clearAllData() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            this.incomeRecords = [];
            this.expenseRecords = [];
            localStorage.removeItem('incomeRecords');
            localStorage.removeItem('expenseRecords');
            this.updateDashboard();
            this.displayRecords();
            this.showNotification('Semua data telah dihapus!', 'success');
        }
    }
}

// Global functions for modal control
function openModal(modalId) {
    app.openModal(modalId);
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function clearAllData() {
    app.clearAllData();
}

// Inisialisasi aplikasi
const app = new FinancialManager();