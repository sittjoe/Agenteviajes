/**
 * Sales Pipeline - Kanban View
 * Sprint 4: Pasos 031-040
 */

const Pipeline = {

    columns: [
        { id: 'lead', name: 'Lead', color: '#94a3b8' },
        { id: 'quoted', name: 'Cotizado', color: '#3b82f6' },
        { id: 'negotiating', name: 'Negociando', color: '#f59e0b' },
        { id: 'closed', name: 'Cerrado', color: '#10b981' },
        { id: 'lost', name: 'Perdido', color: '#ef4444' }
    ],

    /**
     * Paso 031-032: Get quotes grouped by pipeline stage
     */
    getQuotesByStage() {
        const quotes = Storage.getQuotes();
        const grouped = {};

        this.columns.forEach(col => {
            grouped[col.id] = quotes.filter(q => {
                const status = q.status || 'draft';

                switch (col.id) {
                    case 'lead':
                        return status === 'draft';
                    case 'quoted':
                        return status === 'sent';
                    case 'negotiating':
                        return status === 'negotiating';
                    case 'closed':
                        return status === 'accepted';
                    case 'lost':
                        return status === 'rejected';
                    default:
                        return false;
                }
            });
        });

        return grouped;
    },

    /**
     * Paso 033: Move quote between stages
     */
    moveQuote(quoteId, newStage) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return;

        const statusMap = {
            'lead': 'draft',
            'quoted': 'sent',
            'negotiating': 'negotiating',
            'closed': 'accepted',
            'lost': 'rejected'
        };

        quote.status = statusMap[newStage] || 'draft';
        quote.lastStageChange = new Date().toISOString();

        Storage.saveQuote(quote);

        // Add to client timeline
        if (quote.client) {
            const clients = CRM.getClients();
            const client = clients.find(c => c.name === quote.client.name);
            if (client) {
                CRM.addTimelineEvent(client.id, {
                    type: 'status_change',
                    description: `Cotización ${quote.id} movida a ${this.columns.find(c => c.id === newStage)?.name}`,
                    metadata: { quoteId, newStage }
                });
            }
        }

        return quote;
    },

    /**
     * Paso 034: Get column stats
     */
    getColumnStats() {
        const grouped = this.getQuotesByStage();
        const stats = {};

        this.columns.forEach(col => {
            const quotes = grouped[col.id] || [];
            const totalValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0);

            stats[col.id] = {
                count: quotes.length,
                value: totalValue,
                avgValue: quotes.length > 0 ? totalValue / quotes.length : 0
            };
        });

        return stats;
    },

    /**
     * Paso 036: Get urgency indicator
     */
    getUrgency(quote) {
        if (!quote.deadline && !quote.validUntil) return 'low';

        const deadline = quote.deadline || quote.validUntil;
        const daysRemaining = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) return 'overdue';
        if (daysRemaining <= 3) return 'high';
        if (daysRemaining <= 7) return 'medium';
        return 'low';
    },

    /**
     * Paso 037: Filter by date range
     */
    filterByDateRange(startDate, endDate) {
        const quotes = Storage.getQuotes();
        return quotes.filter(q => {
            const createdDate = new Date(q.createdAt);
            return createdDate >= new Date(startDate) && createdDate <= new Date(endDate);
        });
    },

    /**
     * Paso 038: Get calendar of projected closures
     */
    getProjectedClosures() {
        const quotes = Storage.getQuotes().filter(q =>
            (q.status === 'sent' || q.status === 'negotiating') && q.deadline
        );

        const calendar = {};
        quotes.forEach(q => {
            const date = q.deadline.split('T')[0];
            if (!calendar[date]) {
                calendar[date] = [];
            }
            calendar[date].push(q);
        });

        return calendar;
    },

    /**
     * Paso 039: Conversion analytics
     */
    getConversionStats() {
        const quotes = Storage.getQuotes();

        const total = quotes.length;
        const sent = quotes.filter(q => ['sent', 'negotiating', 'accepted'].includes(q.status)).length;
        const negotiating = quotes.filter(q => ['negotiating', 'accepted'].includes(q.status)).length;
        const closed = quotes.filter(q => q.status === 'accepted').length;

        return {
            total,
            leadToQuote: total > 0 ? (sent / total * 100).toFixed(1) : 0,
            quoteToNegotiation: sent > 0 ? (negotiating / sent * 100).toFixed(1) : 0,
            negotiationToClose: negotiating > 0 ? (closed / negotiating * 100).toFixed(1) : 0,
            overallConversion: total > 0 ? (closed / total * 100).toFixed(1) : 0,
            closedCount: closed,
            closedValue: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total || 0), 0)
        };
    },

    /**
     * Paso 040: Monthly goals
     */
    getMonthlyGoal() {
        return Storage.get('monthlyGoal') || { target: 50000, month: new Date().toISOString().slice(0, 7) };
    },

    setMonthlyGoal(target, month) {
        Storage.set('monthlyGoal', { target, month: month || new Date().toISOString().slice(0, 7) });
    },

    getMonthlyProgress() {
        const goal = this.getMonthlyGoal();
        const currentMonth = new Date().toISOString().slice(0, 7);

        const quotes = Storage.getQuotes().filter(q => {
            const quoteMonth = q.createdAt?.slice(0, 7);
            return quoteMonth === currentMonth && q.status === 'accepted';
        });

        const achieved = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
        const percentage = goal.target > 0 ? (achieved / goal.target * 100).toFixed(1) : 0;

        return {
            target: goal.target,
            achieved,
            remaining: Math.max(0, goal.target - achieved),
            percentage,
            quotesCount: quotes.length
        };
    }
};
