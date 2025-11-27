/**
 * UI Controller for Analytics
 */

const Analytics_UI = {
    charts: {},

    init() {
        this.renderDashboard();
    },

    renderDashboard() {
        const data = Analytics.getDashboardData();

        // Update KPIs
        this.updateKPI('kpi-total-sales', App.formatCurrency(data.overview.revenue));
        this.updateKPI('kpi-total-quotes', data.overview.totalQuotes);
        this.updateKPI('kpi-conversion', data.conversion.rate ? data.conversion.rate + '%' : '0%');
        this.updateKPI('kpi-commissions', App.formatCurrency(data.overview.revenue * 0.10)); // Est. 10%

        // Render Charts
        this.renderSalesChart(data.monthlyTrend);
        this.renderDestinationsChart(data.topDestinations);
        this.renderLeadsChart(data.clientStats);
    },

    updateKPI(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    renderSalesChart(trendData) {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.sales) this.charts.sales.destroy();

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(d => d.month),
                datasets: [{
                    label: 'Ventas ($)',
                    data: trendData.map(d => d.revenue),
                    borderColor: '#1e3c72',
                    backgroundColor: 'rgba(30, 60, 114, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    renderDestinationsChart(destinations) {
        const ctx = document.getElementById('destinationsChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.destinations) this.charts.destinations.destroy();

        this.charts.destinations = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: destinations.map(d => d.name),
                datasets: [{
                    data: destinations.map(d => d.count),
                    backgroundColor: [
                        '#1e3c72', '#2a5298', '#d4af37', '#f3d056', '#e2e8f0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    },

    renderLeadsChart(stats) {
        const ctx = document.getElementById('leadsChart')?.getContext('2d');
        if (!ctx) return;

        if (this.charts.leads) this.charts.leads.destroy();

        this.charts.leads = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Leads', 'Clientes', 'VIP'],
                datasets: [{
                    label: 'Clientes',
                    data: [stats.leads, stats.active, stats.vip],
                    backgroundColor: [
                        '#64748b', '#10b981', '#f59e0b'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};

// Hook into App.switchTab
const prevSwitchTab = App.switchTab;
App.switchTab = function (tabId) {
    // Call original (which might be the one from ui-controller.js)
    if (typeof prevSwitchTab === 'function') {
        prevSwitchTab.call(this, tabId);
    } else {
        // Fallback if prevSwitchTab isn't set correctly (shouldn't happen if loaded in order)
        document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
        document.getElementById('view-' + tabId).style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        // Find nav item (simplified)
    }

    if (tabId === 'analytics') {
        Analytics_UI.init();
    }
};
