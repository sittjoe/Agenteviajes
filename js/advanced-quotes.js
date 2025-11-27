/**
 * Advanced Quotes Module
 * Sprint 6: Pasos 051-060
 */

const AdvancedQuotes = {

    /**
     * Paso 051: Compare options (A vs B vs C)
     */
    createComparison(quoteIds) {
        const quotes = quoteIds.map(id => Storage.getQuoteById(id)).filter(q => q);

        return {
            id: 'CMP-' + Date.now(),
            quotes,
            createdAt: new Date().toISOString(),
            comparison: {
                prices: quotes.map(q => q.total),
                deposits: quotes.map(q => q.deposit),
                months: quotes.map(q => q.months),
                features: this.extractFeatures(quotes)
            }
        };
    },

    extractFeatures(quotes) {
        return quotes.map(q => ({
            product: q.product,
            type: q.type,
            dates: q.dates,
            travelers: q.travelers,
            includes: q.includes ? q.includes.split('\n').length : 0,
            excludes: q.excludes ? q.excludes.split('\n').length : 0
        }));
    },

    /**
     * Paso 052: ROI Calculator for client
     */
    calculateROI(quote, clientBudget) {
        const total = quote.total || 0;
        const value = this.estimateExperienceValue(quote);

        return {
            investment: total,
            estimatedValue: value,
            roi: ((value - total) / total * 100).toFixed(1),
            savings: clientBudget - total,
            valuePerDay: quote.dates ? (value / 7).toFixed(0) : 0, // assuming 7 days
            comparison: {
                disney: value,
                traditional: total * 0.7,
                savings: value - (total * 0.7)
            }
        };
    },

    estimateExperienceValue(quote) {
        let base = quote.total || 0;
        const multipliers = {
            'crucero-disney': 1.4,
            'crucero-royal': 1.3,
            'parques-wdw': 1.5,
            'hotel-disney': 1.3
        };

        return base * (multipliers[quote.type] || 1.2);
    },

    /**
     * Paso 053: Quote versioning
     */
    createVersion(quoteId, changes) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return null;

        // Store current version
        quote.versions = quote.versions || [];
        quote.versions.push({
            version: quote.versions.length + 1,
            data: { ...quote },
            createdAt: new Date().toISOString(),
            changes: changes || 'Actualización manual'
        });

        // Apply changes
        Object.assign(quote, changes);
        quote.version = quote.versions.length + 1;
        quote.updatedAt = new Date().toISOString();

        Storage.saveQuote(quote);
        return quote;
    },

    /**
     * Paso 054: Digital signature (basic)
     */
    requestSignature(quoteId, clientEmail) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return null;

        quote.signature = {
            requested: new Date().toISOString(),
            clientEmail,
            status: 'pending', // pending, signed, rejected
            link: `https://app.magiadisney.com/sign/${quoteId}`
        };

        Storage.saveQuote(quote);
        return quote.signature;
    },

    /**
     * Paso 055: Customizable clauses
     */
    clauses: {
        cancellation: {
            name: 'Política de Cancelación',
            options: [
                { id: 'standard', text: 'Cancelación sin penalización hasta 60 días antes del viaje. 50% de penalización entre 30-59 días. No reembolsable con menos de 30 días.' },
                { id: 'flexible', text: 'Cancelación sin penalización hasta 30 días antes. 25% de penalización con menos de 30 días.' },
                { id: 'strict', text: 'No reembolsable. Solo cambios de fecha sujetos a disponibilidad y cargos administrativos.' }
            ]
        },
        payment: {
            name: 'Términos de Pago',
            options: [
                { id: 'standard', text: 'Depósito del 30% para reservar. Saldo restante en pagos mensuales hasta 30 días antes del viaje.' },
                { id: 'full', text: 'Pago total al momento de reservar para garantizar tarifas actuales.' },
                { id: 'flexible', text: 'Depósito del 20% para reservar. Pagos mensuales flexibles sin intereses.' }
            ]
        },
        responsibility: {
            name: 'Responsabilidad',
            options: [
                { id: 'standard', text: 'Magia Disney & Royal actúa como intermediario. Los servicios son proporcionados por proveedores externos (Disney, Royal Caribbean, etc.). No nos hacemos responsables por cambios en itinerarios o políticas de proveedores.' }
            ]
        }
    },

    addClause(quoteId, clauseType, optionId) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return null;

        quote.clauses = quote.clauses || {};
        const clause = this.clauses[clauseType];
        const option = clause?.options.find(o => o.id === optionId);

        if (option) {
            quote.clauses[clauseType] = {
                name: clause.name,
                text: option.text
            };
            Storage.saveQuote(quote);
        }

        return quote;
    },

    /**
     * Paso 056: Discounts and promotions
     */
    applyDiscount(quoteId, discount) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return null;

        const discountAmount = discount.type === 'percentage'
            ? quote.total * (discount.value / 100)
            : discount.value;

        quote.discount = {
            ...discount,
            amount: discountAmount,
            appliedAt: new Date().toISOString()
        };

        quote.subtotal = quote.total;
        quote.total = quote.total - discountAmount;

        Storage.saveQuote(quote);
        return quote;
    },

    /**
     * Paso 057: Upselling suggestions
     */
    getUpsellSuggestions(quote) {
        const suggestions = [];

        if (quote.type?.includes('crucero')) {
            suggestions.push({
                type: 'upgrade',
                title: 'Upgrade a Camarote con Balcón',
                value: 800,
                benefit: 'Vista al mar y espacio privado'
            });
            suggestions.push({
                type: 'addon',
                title: 'Paquete de Bebidas Ilimitadas',
                value: 350,
                benefit: 'Ahorra hasta 40% vs compra individual'
            });
        }

        if (quote.type?.includes('parques')) {
            suggestions.push({
                type: 'addon',
                title: 'Memory Maker',
                value: 169,
                benefit: 'Todas tus fotos profesionales ilimitadas'
            });
            suggestions.push({
                type: 'upgrade',
                title: 'Park Hopper Plus',
                value: 85,
                benefit: 'Acceso a parques acuáticos y golf'
            });
        }

        suggestions.push({
            type: 'insurance',
            title: 'Seguro de Viaje Completo',
            value: quote.total * 0.06,
            benefit: 'Protección total ante cualquier imprevisto'
        });

        return suggestions;
    },

    /**
     * Paso 058: Multi-currency support
     */
    currencies: {
        USD: { symbol: '$', rate: 1, name: 'Dólar Estadounidense' },
        MXN: { symbol: '$', rate: 17.5, name: 'Peso Mexicano' },
        EUR: { symbol: '€', rate: 0.92, name: 'Euro' }
    },

    convertCurrency(amount, from, to) {
        const fromRate = this.currencies[from]?.rate || 1;
        const toRate = this.currencies[to]?.rate || 1;

        return (amount / fromRate) * toRate;
    },

    /**
     * Paso 059: Change history
     */
    getChangeHistory(quoteId) {
        const quote = Storage.getQuoteById(quoteId);
        if (!quote) return [];

        return quote.versions || [];
    },

    /**
     * Paso 060: Expiration alerts
     */
    checkExpirations() {
        const quotes = Storage.getQuotes();
        const now = new Date();
        const alerts = [];

        quotes.forEach(quote => {
            if (!quote.validUntil) return;

            const expiryDate = new Date(quote.validUntil);
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= 0) {
                alerts.push({
                    quote,
                    urgency: 'expired',
                    message: 'Cotización vencida - requiere renovación'
                });
            } else if (daysUntilExpiry <= 3) {
                alerts.push({
                    quote,
                    urgency: 'critical',
                    message: `Vence en ${daysUntilExpiry} días`
                });
            } else if (daysUntilExpiry <= 7) {
                alerts.push({
                    quote,
                    urgency: 'warning',
                    message: `Vence en ${daysUntilExpiry} días`
                });
            }
        });

        return alerts;
    }
};
