/**
 * Storage Manager - Manejo robusto de localStorage con fallbacks
 * Versión 2.0
 */

const Storage = {
    PREFIX: 'mdr_',
    VERSION: '2.0',
    
    KEYS: {
        CONFIG: 'config',
        QUOTES: 'quotes',
        CLIENTS: 'clients',
        FAVORITES: 'favorites',
        RECENTS: 'recents',
        CHECKLIST: 'checklist',
        STATS: 'stats',
        ONBOARDING: 'onboarding',
        THEME: 'theme'
    },
    
    // ===== CORE METHODS =====
    
    _getKey(key) {
        return this.PREFIX + key;
    },
    
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this._getKey(key));
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (e) {
            console.error('Storage.get error:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(this._getKey(key), JSON.stringify(value));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                this._handleQuotaExceeded();
            }
            console.error('Storage.set error:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(this._getKey(key));
            return true;
        } catch (e) {
            console.error('Storage.remove error:', e);
            return false;
        }
    },
    
    _handleQuotaExceeded() {
        // Intentar liberar espacio eliminando datos viejos
        const quotes = this.getQuotes();
        if (quotes.length > 30) {
            // Mantener solo las últimas 30 cotizaciones
            const trimmed = quotes.slice(0, 30);
            this.set(this.KEYS.QUOTES, trimmed);
            App.showToast('⚠️ Espacio lleno. Se eliminaron cotizaciones antiguas.', 'warning');
        }
    },
    
    // ===== CONFIG =====
    
    getConfig() {
        return this.get(this.KEYS.CONFIG, {
            business: {
                name: 'Magia Disney & Royal',
                slogan: 'Parques • Cruceros • Descuentos',
                phone: '55 8095 5139',
                email: '',
                instagram: '',
                facebook: ''
            },
            quotes: {
                prefix: 'MDR',
                nextNumber: 1,
                validityDays: 7,
                currency: 'USD',
                exchangeRate: 17.5,
                showMXN: false,
                legalText: 'Precios sujetos a disponibilidad y cambios sin previo aviso. Cotización válida por el tiempo indicado.'
            },
            appearance: {
                darkMode: false,
                theme: 'default'
            }
        });
    },
    
    saveConfig(config) {
        return this.set(this.KEYS.CONFIG, config);
    },
    
    // ===== QUOTES =====
    
    getQuotes() {
        return this.get(this.KEYS.QUOTES, []);
    },
    
    saveQuote(quote) {
        const quotes = this.getQuotes();
        const existingIndex = quotes.findIndex(q => q.id === quote.id);
        
        if (existingIndex !== -1) {
            quote.updatedAt = new Date().toISOString();
            quotes[existingIndex] = quote;
        } else {
            quote.createdAt = new Date().toISOString();
            quote.updatedAt = quote.createdAt;
            quotes.unshift(quote);
        }
        
        // Limitar a 100 cotizaciones
        const trimmed = quotes.slice(0, 100);
        return this.set(this.KEYS.QUOTES, trimmed);
    },
    
    deleteQuote(id) {
        const quotes = this.getQuotes().filter(q => q.id !== id);
        return this.set(this.KEYS.QUOTES, quotes);
    },
    
    getQuoteById(id) {
        return this.getQuotes().find(q => q.id === id);
    },
    
    generateQuoteId() {
        const config = this.getConfig();
        const year = new Date().getFullYear();
        const num = String(config.quotes.nextNumber).padStart(4, '0');
        
        // Incrementar siguiente número
        config.quotes.nextNumber++;
        this.saveConfig(config);
        
        return `${config.quotes.prefix}-${year}-${num}`;
    },
    
    // ===== CLIENTS =====
    
    getClients() {
        return this.get(this.KEYS.CLIENTS, []);
    },
    
    saveClient(client) {
        const clients = this.getClients();
        const existingIndex = clients.findIndex(c => c.id === client.id);
        
        if (existingIndex !== -1) {
            client.updatedAt = new Date().toISOString();
            clients[existingIndex] = client;
        } else {
            client.id = 'cli_' + Date.now();
            client.createdAt = new Date().toISOString();
            client.updatedAt = client.createdAt;
            clients.unshift(client);
        }
        
        return this.set(this.KEYS.CLIENTS, clients);
    },
    
    deleteClient(id) {
        const clients = this.getClients().filter(c => c.id !== id);
        return this.set(this.KEYS.CLIENTS, clients);
    },
    
    getClientById(id) {
        return this.getClients().find(c => c.id === id);
    },
    
    // ===== FAVORITES & RECENTS =====
    
    getFavorites() {
        return this.get(this.KEYS.FAVORITES, []);
    },
    
    toggleFavorite(id) {
        let favorites = this.getFavorites();
        if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
        } else {
            favorites.unshift(id);
        }
        this.set(this.KEYS.FAVORITES, favorites.slice(0, 15));
        return favorites.includes(id);
    },
    
    isFavorite(id) {
        return this.getFavorites().includes(id);
    },
    
    getRecents() {
        return this.get(this.KEYS.RECENTS, []);
    },
    
    addRecent(id) {
        let recents = this.getRecents().filter(r => r !== id);
        recents.unshift(id);
        this.set(this.KEYS.RECENTS, recents.slice(0, 8));
    },
    
    // ===== CHECKLIST =====
    
    getChecklist() {
        return this.get(this.KEYS.CHECKLIST, {});
    },
    
    saveChecklist(checklist) {
        return this.set(this.KEYS.CHECKLIST, checklist);
    },
    
    // ===== STATS =====
    
    getStats() {
        return this.get(this.KEYS.STATS, {
            quotesCreated: 0,
            quotesSent: 0,
            quotesAccepted: 0,
            totalValue: 0
        });
    },
    
    incrementStat(stat, value = 1) {
        const stats = this.getStats();
        stats[stat] = (stats[stat] || 0) + value;
        this.set(this.KEYS.STATS, stats);
    },
    
    // ===== ONBOARDING =====
    
    isOnboardingComplete() {
        return this.get(this.KEYS.ONBOARDING, false);
    },
    
    completeOnboarding() {
        return this.set(this.KEYS.ONBOARDING, true);
    },
    
    // ===== THEME =====
    
    isDarkMode() {
        const config = this.getConfig();
        return config.appearance?.darkMode || false;
    },
    
    setDarkMode(enabled) {
        const config = this.getConfig();
        config.appearance = config.appearance || {};
        config.appearance.darkMode = enabled;
        this.saveConfig(config);
    },
    
    // ===== EXPORT / IMPORT =====
    
    exportAll() {
        const data = {
            version: this.VERSION,
            exportedAt: new Date().toISOString(),
            config: this.getConfig(),
            quotes: this.getQuotes(),
            clients: this.getClients(),
            favorites: this.getFavorites(),
            stats: this.getStats()
        };
        return JSON.stringify(data, null, 2);
    },
    
    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.config) this.saveConfig(data.config);
            if (data.quotes) this.set(this.KEYS.QUOTES, data.quotes);
            if (data.clients) this.set(this.KEYS.CLIENTS, data.clients);
            if (data.favorites) this.set(this.KEYS.FAVORITES, data.favorites);
            if (data.stats) this.set(this.KEYS.STATS, data.stats);
            
            return { success: true, message: 'Datos importados correctamente' };
        } catch (e) {
            return { success: false, message: 'Error al importar: ' + e.message };
        }
    },
    
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },
    
    // ===== UTILS =====
    
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.PREFIX)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return {
            used: total,
            usedMB: (total / 1024 / 1024).toFixed(2),
            max: 5 * 1024 * 1024, // 5MB típico
            percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1)
        };
    }
};

// Hacer disponible globalmente
window.Storage = Storage;
