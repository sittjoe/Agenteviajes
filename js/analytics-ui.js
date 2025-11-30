/**
 * UI Controller for Analytics
 */

const Analytics_UI = {
    charts: {},

    init() {
        this.renderDashboard();
    },

    renderDashboard() {
        // Get quotes from Storage (Pipeline uses Storage.getQuotes internally)
        const quotes = Storage.getQuotes ? Storage.getQuotes() : [];
        const clients = typeof CRM !== 'undefined' && CRM.getClients ? CRM.getClients() : [];

        // Calculate KPIs
        const wonQuotes = quotes.filter(q => q.status === 'accepted');
        const totalSales = wonQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

        const activeQuotes = quotes.filter(q => q.status !== 'accepted' && q.status !== 'rejected');
        const pipelineValue = activeQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

        const closedQuotesCount = quotes.filter(q => q.status === 'accepted' || q.status === 'rejected').length;
        const conversionRate = closedQuotesCount > 0 ? ((wonQuotes.length / closedQuotesCount) * 100).toFixed(1) : 0;

        const avgTicket = wonQuotes.length > 0 ? totalSales / wonQuotes.length : 0;

        // Update KPI displays
        this.updateKPI('kpi-total-sales', this.formatCurrency(totalSales));
        this.updateKPI('kpi-total-quotes', quotes.length);
        this.updateKPI('kpi-conversion', conversionRate + '%');
        this.updateKPI('kpi-commissions', this.formatCurrency(totalSales * 0.10));

        // Render charts
        this.renderSalesChart(wonQuotes);
        this.renderDestinationsChart(quotes);
        this.renderLeadsChart(quotes);
    },

    formatCurrency(value) {
        if (typeof App !== 'undefined' && App.formatCurrency) {
            return App.formatCurrency(value);
        }
        return '$' + (value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },

    updateKPI(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    renderSalesChart(wonQuotes) {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        // Group sales by month (Last 6 months)
        const months = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('es-MX', { month: 'short' });
            months[key] = 0;
        }

        wonQuotes.forEach(q => {
            const date = new Date(q.createdAt || Date.now());
            const key = date.toLocaleString('es-MX', { month: 'short' });
            if (months.hasOwnProperty(key)) {
                months[key] += (parseFloat(q.total) || 0);
            }
        });

        const data = {
            labels: Object.keys(months),
            datasets: [{
                label: 'Ventas ($)',
                data: Object.values(months),
                borderColor: '#1e3c72',
                backgroundColor: 'rgba(30, 60, 114, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        if (this.charts.sales) {
            this.charts.sales.data = data;
            this.charts.sales.update();
        } else {
            this.charts.sales = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    },

    renderDestinationsChart(quotes) {
        const ctx = document.getElementById('destinationsChart')?.getContext('2d');
        if (!ctx) return;

        // Group by product type
        const destinations = {};
        quotes.forEach(q => {
            const dest = q.product || q.type || 'Otro';
            destinations[dest] = (destinations[dest] || 0) + 1;
        });

        // Get top 5 destinations
        const sorted = Object.entries(destinations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const data = {
            labels: sorted.map(d => d[0].substring(0, 15)),
            datasets: [{
                data: sorted.map(d => d[1]),
                backgroundColor: ['#1e3c72', '#2a5298', '#3b82f6', '#60a5fa', '#93c5fd'],
                borderWidth: 0
            }]
        };

        if (this.charts.destinations) {
            this.charts.destinations.data = data;
            this.charts.destinations.update();
        } else {
            this.charts.destinations = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { boxWidth: 12, font: { size: 11 } }
                        }
                    }
                }
            });
        }
    },

    renderLeadsChart(quotes) {
        const ctx = document.getElementById('leadsChart')?.getContext('2d');
        if (!ctx) return;

        // Group by status for lead sources simulation
        const statusCounts = {
            'Nuevos': quotes.filter(q => q.status === 'draft').length,
            'Enviados': quotes.filter(q => q.status === 'sent').length,
            'Negociando': quotes.filter(q => q.status === 'negotiating').length,
            'Cerrados': quotes.filter(q => q.status === 'accepted').length
        };

        const data = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        };

        if (this.charts.leads) {
            this.charts.leads.data = data;
            this.charts.leads.update();
        } else {
            this.charts.leads = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }
};

// Make globally available
window.Analytics_UI = Analytics_UI;
