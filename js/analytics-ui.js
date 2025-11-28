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
        console.log('Analytics UI Initialized');
        this.updateDashboard();
    },

    updateDashboard() {
        const quotes = Pipeline.getQuotes();
        const clients = CRM.getClients();

        // --- KPI Calculations ---

        // 1. Total Sales (Won Quotes)
        const wonQuotes = quotes.filter(q => q.stage === 'closed_won');
        const totalSales = wonQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

        // 2. Active Pipeline Value (Not Won/Lost)
        const activeQuotes = quotes.filter(q => q.stage !== 'closed_won' && q.stage !== 'closed_lost');
        const pipelineValue = activeQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

        // 3. Conversion Rate
        const closedQuotesCount = quotes.filter(q => q.stage === 'closed_won' || q.stage === 'closed_lost').length;
        const conversionRate = closedQuotesCount > 0 ? ((wonQuotes.length / closedQuotesCount) * 100).toFixed(1) : 0;

        // 4. Average Ticket
        const avgTicket = wonQuotes.length > 0 ? totalSales / wonQuotes.length : 0;

        // --- Update UI ---
        this.updateKPI('total-sales', App.formatCurrency(totalSales), wonQuotes.length > 0 ? 'positive' : 'neutral');
        this.updateKPI('pipeline-value', App.formatCurrency(pipelineValue), 'neutral');
        this.updateKPI('conversion-rate', `${conversionRate}%`, conversionRate > 20 ? 'positive' : 'neutral');
        this.updateKPI('avg-ticket', App.formatCurrency(avgTicket), 'neutral');

        // --- Charts ---
        this.renderSalesChart(wonQuotes);
        this.renderStatusChart(quotes);
    },

    updateKPI(id, value, trend) {
        const el = document.getElementById(`kpi-${id}`);
        if (el) {
            el.textContent = value;
            // Optional: Update trend indicator if UI supports it
        }
    },

    renderSalesChart(wonQuotes) {
        const ctx = document.getElementById('sales-chart')?.getContext('2d');
        if (!ctx) return;

        // Group sales by month (Last 6 months)
        const months = {};
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        wonQuotes.forEach(q => {
            const date = new Date(q.createdAt);
            const key = date.toLocaleString('default', { month: 'short' });
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

    renderStatusChart(quotes) {
        const ctx = document.getElementById('status-chart')?.getContext('2d');
        if (!ctx) return;

        const statusCounts = {
            'Prospecto': 0,
            'Cotizado': 0,
            'Negociación': 0,
            'Cerrado': 0
        };

        quotes.forEach(q => {
            // Map stage IDs to labels
            let label = 'Otros';
            if (q.stage === 'prospect') label = 'Prospecto';
            else if (q.stage === 'qualified' || q.stage === 'proposal') label = 'Cotizado';
            else if (q.stage === 'negotiation') label = 'Negociación';
            else if (q.stage === 'closed_won') label = 'Cerrado';

            if (statusCounts.hasOwnProperty(label)) {
                statusCounts[label]++;
            }
        });

        const data = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        };

        if (this.charts.status) {
            this.charts.status.data = data;
            this.charts.status.update();
        } else {
            this.charts.status = new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                }
            });
        }
    }
};

// Hook into App.switchTab to refresh analytics when tab is opened
if (typeof App !== 'undefined') {
    const prevSwitchTab = typeof App.switchTab === 'function' ? App.switchTab : null;

    App.switchTab = function (tabId) {
        if (typeof prevSwitchTab === 'function') {
            prevSwitchTab.call(this, tabId);
        }

        if (tabId === 'analytics') {
            Analytics_UI.init();
        }
    };
}
