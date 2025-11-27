/**
 * Personalization & Settings Module
 * Sprint 9: Pasos 081-090
 */

const Personalization = {

    /**
     * Paso 081-082: Dark mode & theme system
     */
    themes: {
        light: {
            name: 'Claro',
            '--bg': '#f8fafc',
            '--bg-alt': '#f1f5f9',
            '--card': '#ffffff',
            '--text': '#1e293b',
            '--text-secondary': '#64748b',
            '--border': '#e2e8f0'
        },
        dark: {
            name: 'Oscuro',
            '--bg': '#0f172a',
            '--bg-alt': '#1e293b',
            '--card': '#1e293b',
            '--text': '#f1f5f9',
            '--text-secondary': '#94a3b8',
            '--border': '#334155'
        },
        midnight: {
            name: 'Medianoche',
            '--bg': '#000000',
            '--bg-alt': '#0a0a0a',
            '--card': '#1a1a1a',
            '--text': '#ffffff',
            '--text-secondary': '#a0a0a0',
            '--border': '#2a2a2a'
        }
    },

    getCurrentTheme() {
        return Storage.get('theme') || 'light';
    },

    setTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        Object.keys(theme).forEach(key => {
            if (key !== 'name') {
                root.style.setProperty(key, theme[key]);
            }
        });

        document.body.classList.toggle('dark-mode', themeName !== 'light');
        Storage.set('theme', themeName);
    },

    toggleDarkMode() {
        const current = this.getCurrentTheme();
        const next = current === 'light' ? 'dark' : 'light';
        this.setTheme(next);
        return next;
    },

    /**
     * Paso 083-085: Custom branding
     */
    customBranding: {
        logo: null,
        colors: {
            primary: '#1e3c72',
            accent: '#d4af37'
        },
        signature: ''
    },

    setCustomLogo(base64Image) {
        this.customBranding.logo = base64Image;
        Storage.set('customBranding', this.customBranding);
    },

    setCustomColors(primary, accent) {
        this.customBranding.colors = { primary, accent };
        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--accent', accent);
        Storage.set('customBranding', this.customBranding);
    },

    setSignature(signature) {
        this.customBranding.signature = signature;
        Storage.set('customBranding', this.customBranding);
    },

    /**
     * Paso 086: Multi-language (ES/EN)
     */
    translations: {
        es: {
            welcome: 'Bienvenido',
            quotes: 'Cotizaciones',
            clients: 'Clientes',
            tools: 'Herramientas',
            settings: 'Ajustes',
            new: 'Nueva',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Buscar',
            total: 'Total',
            deposit: 'Apartado',
            months: 'Meses',
            client: 'Cliente',
            product: 'Producto',
            dates: 'Fechas',
            travelers: 'Viajeros',
            notes: 'Notas',
            generatePDF: 'Generar PDF',
            copyMessage: 'Copiar mensaje',
            sendWhatsApp: 'Enviar por WhatsApp'
        },
        en: {
            welcome: 'Welcome',
            quotes: 'Quotes',
            clients: 'Clients',
            tools: 'Tools',
            settings: 'Settings',
            new: 'New',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            total: 'Total',
            deposit: 'Deposit',
            months: 'Months',
            client: 'Client',
            product: 'Product',
            dates: 'Dates',
            travelers: 'Travelers',
            notes: 'Notes',
            generatePDF: 'Generate PDF',
            copyMessage: 'Copy message',
            sendWhatsApp: 'Send via WhatsApp'
        }
    },

    currentLanguage: 'es',

    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLanguage = lang;
        Storage.set('language', lang);
        this.updateUIText();
    },

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    },

    updateUIText() {
        // Update all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
    },

    /**
     * Paso 089: Keyboard shortcuts
     */
    shortcuts: {
        'ctrl+n': () => App.showScreen?.('quote-form') && App.clearQuoteForm?.(),
        'ctrl+s': () => App.saveQuote?.(),
        'ctrl+f': () => document.getElementById('global-search')?.focus(),
        'ctrl+k': () => GlobalSearch?.toggle(),
        'esc': () => App.closeModal?.()
    },

    initShortcuts() {
        document.addEventListener('keydown', (e) => {
            const key = [
                e.ctrlKey && 'ctrl',
                e.metaKey && 'cmd',
                e.shiftKey && 'shift',
                e.altKey && 'alt',
                e.key.toLowerCase()
            ].filter(Boolean).join('+');

            const handler = this.shortcuts[key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    },

    /**
     * Paso 090: Global search (cmd+k style)
     */
    initGlobalSearch() {
        const searchOverlay = document.createElement('div');
        searchOverlay.id = 'global-search-overlay';
        searchOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
            display: none;
            align-items: flex-start;
            justify-content: center;
            padding-top: 100px;
        `;

        searchOverlay.innerHTML = `
            <div style="
                background: var(--card);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                width: 90%;
                max-width: 600px;
                max-height: 500px;
                display: flex;
                flex-direction: column;
            ">
                <input 
                    id="global-search-input" 
                    type="text" 
                    placeholder="Buscar cotizaciones, clientes, destinos..."
                    style="
                        width: 100%;
                        padding: 16px 20px;
                        border: none;
                        border-bottom: 1px solid var(--border);
                        font-size: 16px;
                        background: transparent;
                        color: var(--text);
                    "
                />
                <div id="global-search-results" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                "></div>
            </div>
        `;

        document.body.appendChild(searchOverlay);

        // Toggle function
        window.GlobalSearch = {
            toggle() {
                const overlay = document.getElementById('global-search-overlay');
                const isVisible = overlay.style.display === 'flex';
                overlay.style.display = isVisible ? 'none' : 'flex';
                if (!isVisible) {
                    document.getElementById('global-search-input').focus();
                }
            }
        };

        // Search functionality
        const input = document.getElementById('global-search-input');
        const results = document.getElementById('global-search-results');

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                results.innerHTML = '';
                return;
            }

            const quotes = Storage.getQuotes().filter(q =>
                q.client?.name?.toLowerCase().includes(query) ||
                q.product?.toLowerCase().includes(query) ||
                q.id?.toLowerCase().includes(query)
            );

            const clients = (CRM?.getClients() || []).filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query)
            );

            let html = '';

            if (quotes.length > 0) {
                html += '<div style="padding: 10px; font-weight: 600; color: var(--text-secondary); font-size: 12px;">COTIZACIONES</div>';
                quotes.slice(0, 5).forEach(q => {
                    html += `
                        <div class="search-result" onclick="App.viewQuote?.('${q.id}'); GlobalSearch.toggle();" style="
                            padding: 12px;
                            cursor: pointer;
                            border-radius: var(--radius);
                            margin-bottom: 4px;
                        ">
                            <div style="font-weight: 600;">${q.client?.name || 'Sin nombre'}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${q.product} - ${App.formatCurrency?.(q.total)}</div>
                        </div>
                    `;
                });
            }

            if (clients.length > 0) {
                html += '<div style="padding: 10px; font-weight: 600; color: var(--text-secondary); font-size: 12px;">CLIENTES</div>';
                clients.slice(0, 5).forEach(c => {
                    html += `
                        <div class="search-result" onclick="GlobalSearch.toggle();" style="
                            padding: 12px;
                            cursor: pointer;
                            border-radius: var(--radius);
                            margin-bottom: 4px;
                        ">
                            <div style="font-weight: 600;">${c.name}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">${c.email || c.phone}</div>
                        </div>
                    `;
                });
            }

            if (html === '') {
                html = '<div style="padding: 40px; text-align: center; color: var(--text-muted);">No se encontraron resultados</div>';
            }

            results.innerHTML = html;

            // Add hover effects
            results.querySelectorAll('.search-result').forEach(el => {
                el.addEventListener('mouseenter', () => el.style.background = 'var(--bg-alt)');
                el.addEventListener('mouseleave', () => el.style.background = 'transparent');
            });
        });

        // Close on click outside
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                GlobalSearch.toggle();
            }
        });

        // Close on ESC
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                GlobalSearch.toggle();
            }
        });
    },

    /**
     * Initialize all personalization features
     */
    init() {
        // Load saved theme
        const savedTheme = this.getCurrentTheme();
        this.setTheme(savedTheme);

        // Load saved language
        const savedLang = Storage.get('language') || 'es';
        this.currentLanguage = savedLang;

        // Load custom branding
        const savedBranding = Storage.get('customBranding');
        if (savedBranding) {
            this.customBranding = savedBranding;
            if (savedBranding.colors) {
                this.setCustomColors(savedBranding.colors.primary, savedBranding.colors.accent);
            }
        }

        // Init shortcuts and search
        this.initShortcuts();
        this.initGlobalSearch();
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        Personalization.init();
    });
}
