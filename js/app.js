/**
 * App Principal - Magia Disney & Royal
 * Versión 2.0 - Robusto y Profesional
 */

const App = {
    // ===== STATE =====
    state: {
        currentTab: 'inicio',
        currentStage: null,
        currentResponse: null,
        currentQuote: null,
        editingQuoteId: null,
        viewingQuoteId: null,
        unsavedChanges: false,
        isLoading: false,
        currentWDWPark: 'magicKingdom'
    },

    // ===== INITIALIZATION =====
    init() {
        console.log('🚀 Iniciando Magia Disney & Royal v2.0');

        // Load saved state
        this.loadTheme();
        this.loadConfig();

        // Initialize UI
        this.renderFavorites();
        this.renderRecents();
        this.renderQuotesList();
        this.loadChecklist();
        this.updateStats();
        this.renderWDWGuide();

        // Setup event listeners
        this.setupEventListeners();

        // Register Service Worker
        this.registerSW();

        // Check onboarding
        if (!Storage.isOnboardingComplete()) {
            setTimeout(() => this.showOnboarding(), 500);
        }

        console.log('✅ App iniciada correctamente');
    },

    setupEventListeners() {
        // Prevent accidental navigation with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.state.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '¿Seguro que quieres salir? Tienes cambios sin guardar.';
            }
        });

        // Handle back button
        window.addEventListener('popstate', (e) => {
            this.handleBackNavigation();
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.handleQuickSave();
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('✅ Service Worker registrado');
                    // Check for updates
                    reg.addEventListener('updatefound', () => {
                        this.showToast('🔄 Nueva versión disponible. Recarga para actualizar.', 'info', 5000);
                    });
                })
                .catch(err => console.error('SW error:', err));
        }
    },

    // ===== THEME =====
    loadTheme() {
        const isDark = Storage.isDarkMode();
        document.body.classList.toggle('dark-mode', isDark);
        const checkbox = document.getElementById('config-darkmode');
        if (checkbox) checkbox.checked = isDark;
    },

    toggleDarkMode() {
        const isDark = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', isDark);
        Storage.setDarkMode(isDark);
        const checkbox = document.getElementById('config-darkmode');
        if (checkbox) checkbox.checked = isDark;
    },

    // ===== CONFIG =====
    loadConfig() {
        const config = Storage.getConfig();

        // Business info
        this.setInputValue('config-phone', config.business?.phone || '55 8095 5139');
        this.setInputValue('config-email', config.business?.email || '');
        this.setInputValue('config-instagram', config.business?.instagram || '');
        this.setInputValue('config-facebook', config.business?.facebook || '');

        // Quotes config
        this.setInputValue('config-prefix', config.quotes?.prefix || 'MDR');
        this.setInputValue('config-validity', config.quotes?.validityDays || 7);
        this.setInputValue('config-currency', config.quotes?.currency || 'USD');
        this.setInputValue('config-exchange', config.quotes?.exchangeRate || 17.5);
        this.setInputValue('config-legal', config.quotes?.legalText || 'Precios sujetos a disponibilidad.');

        // Appearance
        const checkbox = document.getElementById('config-darkmode');
        if (checkbox) checkbox.checked = config.appearance?.darkMode || false;
    },

    saveConfig() {
        const config = Storage.getConfig();

        config.business = {
            name: 'Magia Disney & Royal',
            slogan: 'Parques • Cruceros • Descuentos',
            phone: this.getInputValue('config-phone'),
            email: this.getInputValue('config-email'),
            instagram: this.getInputValue('config-instagram'),
            facebook: this.getInputValue('config-facebook')
        };

        config.quotes = {
            ...config.quotes,
            prefix: this.getInputValue('config-prefix') || 'MDR',
            validityDays: parseInt(this.getInputValue('config-validity')) || 7,
            currency: this.getInputValue('config-currency') || 'USD',
            exchangeRate: parseFloat(this.getInputValue('config-exchange')) || 17.5,
            legalText: this.getInputValue('config-legal')
        };

        config.appearance = {
            darkMode: document.getElementById('config-darkmode')?.checked || false,
            theme: 'default'
        };

        Storage.saveConfig(config);
        this.showToast('💾 Configuración guardada', 'success');
    },

    // ===== TAB NAVIGATION =====
    showTab(tabId, element) {
        // Check for unsaved changes
        if (this.state.unsavedChanges && this.state.currentTab === 'cotizar') {
            if (!confirm('¿Tienes cambios sin guardar. ¿Salir de todos modos?')) {
                return;
            }
            this.state.unsavedChanges = false;
        }

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        // Show selected tab
        const tab = document.getElementById('tab-' + tabId);
        if (tab) tab.classList.add('active');
        if (element) element.classList.add('active');

        this.state.currentTab = tabId;

        // Reset screens within tab
        if (tabId === 'inicio') this.showHomeMain();
        if (tabId === 'cotizar') this.showQuotesList();
        if (tabId === 'clientes') this.renderClientsList();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ===== HOME NAVIGATION =====
    showHomeMain() {
        this.switchScreen('tab-inicio', 'home-main');
        this.state.currentStage = null;
        this.state.currentResponse = null;
    },

    showStage(stageId) {
        const stage = Data.stages[stageId];
        if (!stage) return;

        this.state.currentStage = stageId;

        // Update title
        document.getElementById('stage-title').textContent = stage.name;

        // Render situations
        const list = document.getElementById('situations-list');
        list.innerHTML = stage.situations.map(id => {
            const r = Data.responses[id];
            if (!r) return '';
            return `
                <div class="option-item" onclick="App.showResponse('${id}')">
                    <span class="emoji">${r.icon}</span>
                    <div class="content">
                        <div class="title">${r.title}</div>
                    </div>
                    <span class="arrow">→</span>
                </div>
            `;
        }).join('');

        this.switchScreen('tab-inicio', 'home-stage');
    },

    showResponse(responseId) {
        const response = Data.responses[responseId];
        if (!response) {
            this.showToast('Respuesta no encontrada', 'error');
            return;
        }

        this.state.currentResponse = responseId;
        Storage.addRecent(responseId);
        this.renderRecents();

        // Render breadcrumb
        const isFav = Storage.isFavorite(responseId);
        let breadcrumb = `
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="App.toggleFavorite('${responseId}')">
                ${isFav ? '⭐' : '☆'}
            </button>
        `;
        if (this.state.currentStage) {
            breadcrumb += `
                <span class="breadcrumb-item">${Data.stages[this.state.currentStage].name}</span>
                <span class="breadcrumb-arrow">→</span>
            `;
        }
        breadcrumb += `<span class="breadcrumb-item active">${response.title}</span>`;
        document.getElementById('response-breadcrumb').innerHTML = breadcrumb;

        // Render next actions
        const nextActionsHtml = response.nextActions?.map(a =>
            `<div class="next-opt-btn" onclick="App.showResponse('${a.goto}')">${a.label}</div>`
        ).join('') || '';

        // Render content
        document.getElementById('response-content').innerHTML = `
            <div class="composer">
                <div class="composer-header">
                    <span>📱</span> Mensaje para enviar
                </div>
                <div class="composer-body">
                    <div class="message-preview">${this.escapeHtml(response.message)}</div>
                    <div class="btn-row">
                        <button class="btn-success" onclick="App.copyMessage()">
                            📋 Copiar
                        </button>
                        <button class="btn-whatsapp" onclick="App.sendWhatsApp()">
                            💬 WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <div class="vote-box" id="vote-container"></div>

            <div class="tip-box">
                <h4>💡 Tip</h4>
                <p>${response.tip}</p>
            </div>
            
            ${response.next ? `
            <div class="next-box">
                <h4>➡️ Probablemente te responda...</h4>
                <p>${response.next}</p>
                ${nextActionsHtml ? '<div class="next-options">' + nextActionsHtml + '</div>' : ''}
            </div>
            ` : ''}
        `;

        this.switchScreen('tab-inicio', 'home-response');

        // Render votes after DOM is updated
        this.renderVoteControls(responseId);
    },

    copyMessage() {
        const response = Data.responses[this.state.currentResponse];
        if (response) {
            this.copyToClipboard(response.message);
        }
    },

    sendWhatsApp() {
        const response = Data.responses[this.state.currentResponse];
        if (response) {
            const text = encodeURIComponent(response.message);
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }
    },

    backToHome() {
        this.showHomeMain();
    },

    backToStage() {
        if (this.state.currentStage) {
            this.showStage(this.state.currentStage);
        } else {
            this.showHomeMain();
        }
    },

    // ===== FAVORITES & RECENTS =====
    renderFavorites() {
        const favorites = Storage.getFavorites();
        const section = document.getElementById('favorites-section');
        const list = document.getElementById('favorites-list');

        if (!section || !list) return;

        if (favorites.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = favorites.map(id => {
            const r = Data.responses[id];
            if (!r) return '';
            return `
                <div class="option-item compact" onclick="App.showResponse('${id}')">
                    <span class="emoji">⭐</span>
                    <div class="content">
                        <div class="title">${r.title}</div>
                    </div>
                    <span class="arrow">→</span>
                </div>
            `;
        }).join('');
    },

    renderRecents() {
        const recents = Storage.getRecents();
        const section = document.getElementById('recents-section');
        const list = document.getElementById('recents-list');

        if (!section || !list) return;

        if (recents.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = recents.map(id => {
            const r = Data.responses[id];
            if (!r) return '';
            return `
                <div class="option-item compact" onclick="App.showResponse('${id}')">
                    <span class="emoji">🕐</span>
                    <div class="content">
                        <div class="title">${r.title}</div>
                    </div>
                    <span class="arrow">→</span>
                </div>
            `;
        }).join('');
    },

    toggleFavorite(id) {
        const isNowFav = Storage.toggleFavorite(id);
        this.showToast(isNowFav ? '⭐ Agregado a favoritos' : 'Eliminado de favoritos', 'success');
        this.renderFavorites();

        // Update button if visible
        const btn = document.querySelector('.fav-btn');
        if (btn) {
            btn.classList.toggle('active', isNowFav);
            btn.textContent = isNowFav ? '⭐' : '☆';
        }
    },

    // ===== RESPONSE VOTES =====
    renderVoteControls(responseId) {
        const container = document.getElementById('vote-container');
        if (!container) return;

        const { up, down, userVote } = Storage.getResponseVoteStatus(responseId);
        const total = up + down;
        const helpfulPercent = total > 0 ? Math.round((up / total) * 100) : 0;

        container.innerHTML = `
            <div class="vote-actions">
                <button class="vote-btn ${userVote === 1 ? 'active' : ''}" onclick="App.handleVote('${responseId}', 1)">👍 Útil</button>
                <button class="vote-btn ${userVote === -1 ? 'active' : ''}" onclick="App.handleVote('${responseId}', -1)">👎 No útil</button>
            </div>
            <div class="vote-stats">
                <span>${up} votos útiles</span>
                <span>${down} votos no útiles</span>
                <span>${helpfulPercent}% de utilidad</span>
            </div>
        `;
    },

    handleVote(responseId, value) {
        const result = Storage.toggleResponseVote(responseId, value);
        this.renderVoteControls(responseId);

        let message = 'Voto eliminado';
        if (result.userVote === 1) message = '👍 Gracias por marcarlo como útil';
        if (result.userVote === -1) message = '🤔 Registrado como no útil';

        this.showToast(message, 'success');
    },

    // ===== SEARCH =====
    handleSearch() {
        const query = this.getInputValue('globalSearch')?.toLowerCase().trim();
        const resultsContainer = document.getElementById('searchResults');

        if (!query || query.length < 2) {
            resultsContainer?.classList.remove('show');
            return;
        }

        // Search in responses
        const results = Object.entries(Data.responses).filter(([id, r]) =>
            r.title.toLowerCase().includes(query) ||
            r.message.toLowerCase().includes(query) ||
            r.tags?.some(t => t.toLowerCase().includes(query))
        ).slice(0, 10);

        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item"><div class="title">No se encontraron resultados</div></div>';
        } else {
            resultsContainer.innerHTML = results.map(([id, r]) => `
                <div class="search-result-item" onmousedown="App.showResponse('${id}'); App.clearSearch();">
                    <div class="title">${r.icon} ${r.title}</div>
                    <div class="subtitle">${r.message.substring(0, 50)}...</div>
                </div>
            `).join('');
        }

        resultsContainer.classList.add('show');
    },

    clearSearch() {
        const input = document.getElementById('globalSearch');
        const results = document.getElementById('searchResults');
        if (input) input.value = '';
        if (results) results.classList.remove('show');
    },

    showSearchResults() {
        const query = this.getInputValue('globalSearch');
        if (query && query.length >= 2) {
            document.getElementById('searchResults')?.classList.add('show');
        }
    },

    hideSearchResults() {
        setTimeout(() => {
            document.getElementById('searchResults')?.classList.remove('show');
        }, 200);
    },

    // ===== UTILITIES =====
    switchScreen(tabId, screenId) {
        document.querySelectorAll(`#${tabId} .screen`).forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    getInputValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    },

    setInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    },

    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('✅ ¡Copiado!', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            this.showToast('✅ ¡Copiado!', 'success');
        } catch (err) {
            this.showToast('Error al copiar', 'error');
        }
        document.body.removeChild(textarea);
    },

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        // Play sound based on type
        if (type === 'success') this.playSound('success');
        if (type === 'error') this.playSound('error');

        toast.textContent = message;
        toast.className = 'toast show ' + type;

        setTimeout(() => toast.classList.remove('show'), duration);
    },

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        document.body.classList.toggle('loading', isLoading);
    },

    handleBackNavigation() {
        if (this.state.currentTab === 'inicio') {
            if (this.state.currentResponse) {
                this.backToStage();
            } else if (this.state.currentStage) {
                this.showHomeMain();
            }
        }
    },

    handleQuickSave() {
        if (this.state.currentTab === 'cotizar' && this.state.unsavedChanges) {
            this.saveQuote();
        } else if (this.state.currentTab === 'ajustes') {
            this.saveConfig();
        }
    },

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
    },

    // ===== WDW VISUAL GUIDE =====
    renderWDWGuide() {
        const guide = Data.productInfo?.wdwParksGuide;
        const selector = document.getElementById('wdw-park-selector');
        const detail = document.getElementById('wdw-park-detail');

        if (!guide || !selector || !detail) return;

        selector.innerHTML = '';

        Object.entries(guide).forEach(([key, park], index) => {
            const btn = document.createElement('button');
            btn.innerHTML = `${park.icon} ${park.name}`;
            btn.classList.toggle('active', this.state.currentWDWPark === key || (!this.state.currentWDWPark && index === 0));
            btn.addEventListener('click', () => this.renderWDWPark(key));
            selector.appendChild(btn);
        });

        this.renderWDWPark(this.state.currentWDWPark || Object.keys(guide)[0]);
    },

    renderWDWPark(parkId) {
        const guide = Data.productInfo?.wdwParksGuide;
        const detail = document.getElementById('wdw-park-detail');
        const selector = document.getElementById('wdw-park-selector');
        if (!guide || !guide[parkId] || !detail) return;

        this.state.currentWDWPark = parkId;
        const park = guide[parkId];

        if (selector) {
            selector.querySelectorAll('button').forEach(btn => {
                const isActive = btn.textContent.includes(park.name);
                btn.classList.toggle('active', isActive);
            });
        }

        const renderList = (items) => items.map(item => `<span class="wdw-chip">${item}</span>`).join('');
        const renderPlan = (steps) => steps.map(step => `
            <div class="wdw-plan-step">
                <div class="wdw-plan-time">${step.time}</div>
                <div>${step.detail}</div>
            </div>
        `).join('');

        detail.innerHTML = `
            <div class="wdw-hero">
                <div class="wdw-park-main">
                    <span class="wdw-park-icon">${park.icon}</span>
                    <div>
                        <div class="wdw-park-name">${park.name}</div>
                        <div class="wdw-park-tagline">${park.tagline}</div>
                    </div>
                </div>
                <div class="wdw-badges">${park.badges.map(b => `<span class="wdw-badge">${b}</span>`).join('')}</div>
            </div>
            <div class="wdw-grid">
                <div class="wdw-block">
                    <h4>✨ Imperdibles</h4>
                    <div class="wdw-chip-list">${renderList(park.highlights)}</div>
                    <div class="wdw-note">⚡ Combina Multi Pass + rope drop para filas mínimas.</div>
                </div>
                <div class="wdw-block">
                    <h4>⚡ Lightning Lane prioridad</h4>
                    <ul class="wdw-list">
                        ${park.lightning.map(item => `<li>${item}<div class="wdw-meta-row"><span>Reserva temprano</span><span>⏱️ 7:00 AM</span></div></li>`).join('')}
                    </ul>
                </div>
                <div class="wdw-block">
                    <h4>🗺️ Plan de día perfecto</h4>
                    <div class="wdw-plan">${renderPlan(park.plan)}</div>
                    <div class="wdw-note">🕒 Ajusta horarios si tienes Early Entry o Park Hopper.</div>
                </div>
                <div class="wdw-block">
                    <h4>🍦 Snacks & momentos WOW</h4>
                    <ul class="wdw-list">
                        <li><strong>Snacks icónicos:</strong> ${park.bites.join(' • ')}</li>
                        <li><strong>Fotos obligadas:</strong> ${park.moments.join(' • ')}</li>
                    </ul>
                </div>
            </div>
        `;
    },

    // ===== SOUNDS =====
    playSound(type) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                // Nice "ding"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } else if (type === 'pop') {
                // Short pop
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } else if (type === 'error') {
                // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            console.error('Audio error', e);
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make App available globally
window.App = App;
