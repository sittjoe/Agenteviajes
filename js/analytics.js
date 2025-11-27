/**
 * Analytics & Reporting Module
 * Sprint 8: Pasos 071-080
 */

const Analytics = {

    /**
     * Paso 071-072: Sales dashboard with charts
     */
    getDashboardData() {
        const quotes = Storage.getQuotes();
        const clients = CRM?.getClients() || [];

        return {
            overview: this.getOverview(quotes),
            conversion: Pipeline?.getConversionStats() || {},
            topDestinations: this.getTopDestinations(quotes),
            monthlyTrend: this.getMonthlyTrend(quotes),
            clientStats: {
                total: clients.length,
                leads: clients.filter(c => c.status === 'lead').length,
                active: clients.filter(c => c.status === 'cliente').length,
                vip: clients.filter(c => c.status === 'vip').length
            }
        };
    },

    getOverview(quotes) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const thisMonthQuotes = quotes.filter(q => {
            const d = new Date(q.createdAt);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const closedThisMonth = thisMonthQuotes.filter(q => q.status === 'accepted');

        return {
            totalQuotes: quotes.length,
            thisMonth: thisMonthQuotes.length,
            closed: closedThisMonth.length,
            revenue: closedThisMonth.reduce((sum, q) => sum + (q.total || 0), 0),
            avgQuoteValue: quotes.length > 0
                ? quotes.reduce((sum, q) => sum + (q.total || 0), 0) / quotes.length
                : 0
        };
    },

    /**
     * Paso 073: Top destinations sold
     */
    getTopDestinations(quotes, limit = 10) {
        const destinations = {};

        quotes.forEach(q => {
            if (!q.product) return;

            destinations[q.product] = destinations[q.product] || {
                name: q.product,
                count: 0,
                revenue: 0,
                type: q.type
            };

            destinations[q.product].count++;
            if (q.status === 'accepted') {
                destinations[q.product].revenue += q.total || 0;
            }
        });

        return Object.values(destinations)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    /**
     * Paso 074: Commission calculator
     */
    calculateCommissions(quotes, rate = 0.10) {
        const closed = quotes.filter(q => q.status === 'accepted');

        const byType = {};
        closed.forEach(q => {
            const type = q.type || 'otro';
            byType[type] = byType[type] || { count: 0, sales: 0, commission: 0 };
            byType[type].count++;
            byType[type].sales += q.total || 0;
            byType[type].commission += (q.total || 0) * rate;
        });

        const total = closed.reduce((sum, q) => sum + (q.total || 0), 0);

        return {
            totalSales: total,
            totalCommission: total * rate,
            rate: rate * 100,
            byType,
            count: closed.length
        };
    },

    /**
     * Paso 075: Revenue projection
     */
    getRevenueProjection() {
        const quotes = Storage.getQuotes();
        const pipeline = quotes.filter(q =>
            ['sent', 'negotiating'].includes(q.status)
        );

        // Historical conversion rate
        const totalSent = quotes.filter(q =>
            ['sent', 'negotiating', 'accepted', 'rejected'].includes(q.status)
        ).length;
        const closed = quotes.filter(q => q.status === 'accepted').length;
        const conversionRate = totalSent > 0 ? closed / totalSent : 0.25;

        const projected = pipeline.reduce((sum, q) => sum + (q.total || 0), 0);
        const expected = projected * conversionRate;

        const closedRevenue = quotes
            .filter(q => q.status === 'accepted')
            .reduce((sum, q) => sum + (q.total || 0), 0);

        return {
            confirmed: closedRevenue,
            pipeline: projected,
            expected: expected,
            total: closedRevenue + expected,
            conversionRate: (conversionRate * 100).toFixed(1),
            pipelineCount: pipeline.length
        };
    },

    /**
     * Paso 076-077: Monthly reports and year comparison
     */
    getMonthlyReport(year, month) {
        const quotes = Storage.getQuotes().filter(q => {
            const d = new Date(q.createdAt);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        return {
            period: `${year}-${String(month + 1).padStart(2, '0')}`,
            quotes: {
                total: quotes.length,
                closed: quotes.filter(q => q.status === 'accepted').length,
                rejected: quotes.filter(q => q.status === 'rejected').length,
                pending: quotes.filter(q => ['sent', 'negotiating'].includes(q.status)).length
            },
            revenue: quotes
                .filter(q => q.status === 'accepted')
                .reduce((sum, q) => sum + (q.total || 0), 0),
            topProduct: this.getTopDestinations(quotes, 1)[0],
            conversionRate: this.calculateConversionRate(quotes)
        };
    },

    getYearComparison(year1, year2) {
        const quotes1 = Storage.getQuotes().filter(q =>
            new Date(q.createdAt).getFullYear() === year1
        );
        const quotes2 = Storage.getQuotes().filter(q =>
            new Date(q.createdAt).getFullYear() === year2
        );

        const revenue1 = quotes1.filter(q => q.status === 'accepted')
            .reduce((sum, q) => sum + (q.total || 0), 0);
        const revenue2 = quotes2.filter(q => q.status === 'accepted')
            .reduce((sum, q) => sum + (q.total || 0), 0);

        return {
            [year1]: { count: quotes1.length, revenue: revenue1 },
            [year2]: { count: quotes2.length, revenue: revenue2 },
            growth: {
                count: quotes2.length - quotes1.length,
                countPercent: quotes1.length > 0
                    ? ((quotes2.length - quotes1.length) / quotes1.length * 100).toFixed(1)
                    : 0,
                revenue: revenue2 - revenue1,
                revenuePercent: revenue1 > 0
                    ? ((revenue2 - revenue1) / revenue1 * 100).toFixed(1)
                    : 0
            }
        };
    },

    /**
     * Paso 078: Lead source analysis
     */
    getLeadSources() {
        const clients = CRM?.getClients() || [];
        const sources = {};

        clients.forEach(c => {
            const source = c.source || 'Directo';
            sources[source] = (sources[source] || 0) + 1;
        });

        return Object.entries(sources)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    },

    /**
     * Paso 079: Average time to close
     */
    getAverageTimeToClose() {
        const closed = Storage.getQuotes().filter(q => q.status === 'accepted');

        if (closed.length === 0) return 0;

        const times = closed.map(q => {
            const created = new Date(q.createdAt);
            const updated = new Date(q.updatedAt);
            return (updated - created) / (1000 * 60 * 60 * 24); // days
        });

        return times.reduce((sum, t) => sum + t, 0) / times.length;
    },

    /**
     * Paso 080: Client satisfaction metrics
     */
    getSatisfactionMetrics() {
        const clients = CRM?.getClients() || [];
        const quotes = Storage.getQuotes();

        return {
            repeatClients: this.getRepeatClients(clients, quotes),
            avgQuotesPerClient: clients.length > 0 ? quotes.length / clients.length : 0,
            responseTime: this.getAvgResponseTime(),
            nps: this.calculateNPS(clients)
        };
    },

    getRepeatClients(clients, quotes) {
        let repeat = 0;
        clients.forEach(c => {
            const clientQuotes = quotes.filter(q =>
                q.client?.name === c.name || q.client?.email === c.email
            );
            if (clientQuotes.length > 1) repeat++;
        });
        return repeat;
    },

    getAvgResponseTime() {
        // Placeholder - would need actual message tracking
        return 2.5; // hours
    },

    calculateNPS(clients) {
        // Placeholder - would need actual survey data
        const promoters = clients.filter(c => c.status === 'vip').length;
        const total = clients.length;
        return total > 0 ? (promoters / total * 100).toFixed(0) : 0;
    },

    /**
     * Helper: Monthly trend
     */
    getMonthlyTrend(quotes) {
        const last12Months = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthQuotes = quotes.filter(q => {
                const d = new Date(q.createdAt);
                return d.getMonth() === month.getMonth() &&
                    d.getFullYear() === month.getFullYear();
            });

            last12Months.push({
                month: month.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
                count: monthQuotes.length,
                revenue: monthQuotes
                    .filter(q => q.status === 'accepted')
                    .reduce((sum, q) => sum + (q.total || 0), 0)
            });
        }

        return last12Months;
    },

    calculateConversionRate(quotes) {
        const total = quotes.length;
        const closed = quotes.filter(q => q.status === 'accepted').length;
        return total > 0 ? (closed / total * 100).toFixed(1) : 0;
    }
};
