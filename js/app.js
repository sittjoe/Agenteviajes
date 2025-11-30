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
        this.restoreLastTab();
        this.renderBusinessIdentity();

        // Initialize UI
        this.renderQuotesList();
        this.loadChecklist();
        this.updateStats();
        this.renderWDWGuide();
        this.renderProductInfoCards();
        this.populateQuickResponseFilters();
        this.renderQuickResponses();

        // Setup event listeners
        this.setupEventListeners();

        // Complete onboarding silently to evitar popups
        if (!Storage.isOnboardingComplete()) {
            Storage.completeOnboarding();
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

        // Simple keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
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
        this.renderBusinessIdentity();
    },

    renderBusinessIdentity() {
        const business = Storage.getConfig().business || {};

        const setText = (id, value, fallback = '') => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || fallback;
        };

        setText('business-name', business.name || 'Tu agencia');
        setText('business-slogan', business.slogan || 'Define tu propuesta de valor');
        setText('business-phone', business.phone || 'Agrega tu teléfono');
        setText('business-email', business.email || 'Configura tu correo');
        setText('business-ig', business.instagram || 'Añade Instagram');
        setText('business-fb', business.facebook || 'Añade Facebook');
    },

    copyBusinessContact(type) {
        const business = Storage.getConfig().business || {};
        const values = {
            phone: business.phone,
            email: business.email,
            instagram: business.instagram,
            facebook: business.facebook
        };

        const value = values[type];

        if (!value) {
            this.showToast('Configura este dato en Ajustes para poder compartirlo.', 'warning');
            return;
        }

        this.copyToClipboard(value);
    },

    // ===== TAB NAVIGATION =====
    switchTab(viewId) {
        // Show only the requested view inside the tools tab
        document.querySelectorAll('.view-section').forEach(section => {
            section.style.display = 'none';
        });

        // Handle tools-main as default
        if (viewId === 'tools-main') {
            const toolsMain = document.getElementById('view-tools-main');
            if (toolsMain) toolsMain.style.display = 'block';
            this.state.currentToolView = viewId;
            return;
        }

        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.style.display = 'block';
        }

        // Lazy-init heavy views
        if (viewId === 'pipeline' && window.Pipeline_UI?.init) {
            window.Pipeline_UI.init();
        }

        if (viewId === 'crm' && window.CRM_UI?.init) {
            window.CRM_UI.init();
        }

        if (viewId === 'analytics' && window.Analytics_UI?.init) {
            window.Analytics_UI.init();
        }

        this.state.currentToolView = viewId;
    },

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

        const matchingNavs = document.querySelectorAll(`.nav-item[data-tab="${tabId}"]`);
        matchingNavs.forEach(n => n.classList.add('active'));

        this.state.currentTab = tabId;

        // Reset screens within tab
        if (tabId === 'inicio') this.showHomeMain();
        if (tabId === 'cotizar') this.showQuotesList();
        if (tabId === 'clientes' && window.CRM_UI) window.CRM_UI.renderClientList();

        Storage.setLastTab(tabId);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    restoreLastTab() {
        const saved = Storage.getLastTab();
        if (saved && document.getElementById('tab-' + saved)) {
            this.showTab(saved);
        }
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

        // Render breadcrumb
        let breadcrumb = '';
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
    },

    // ===== RESPUESTAS RÁPIDAS (Info tab) =====
    renderQuickResponses(stageFilter = 'all', query = '') {
        const container = document.getElementById('quick-responses-grid');
        if (!container) return;

        const normalizedQuery = query.toLowerCase();
        const stageOrder = Object.keys(Data.stages || {}).reduce((acc, key, index) => {
            acc[key] = index;
            return acc;
        }, {});

        const responses = Object.values(Data.responses).filter(r => {
            const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
            const haystack = `${r.title} ${r.message} ${(r.tags || []).join(' ')}`.toLowerCase();
            const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
            return matchesStage && matchesQuery;
        }).sort((a, b) => {
            const stageDiff = (stageOrder[a.stage] || 99) - (stageOrder[b.stage] || 99);
            if (stageDiff !== 0) return stageDiff;
            return a.title.localeCompare(b.title);
        });

        if (responses.length === 0) {
            container.innerHTML = '<p class="muted">No hay respuestas para ese filtro.</p>';
            return;
        }

        container.innerHTML = responses.map(r => `
            <div class="response-card">
                <div class="response-card-header">
                    <div class="response-meta">
                        <span class="emoji">${r.icon}</span>
                        <div>
                            <div class="response-title">${r.title}</div>
                            <div class="response-stage">${Data.stages?.[r.stage]?.name || ''}</div>
                        </div>
                    </div>
                    ${r.tags ? `<div class="response-tags">${r.tags.slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>` : ''}
                </div>
                <div class="response-card-body">${this.escapeHtml(r.message)}</div>
                <div class="response-card-actions">
                    <button class="btn-success btn-sm" onclick="App.copyResponseById('${r.id}')">📋 Copiar</button>
                    <button class="btn-whatsapp btn-sm" onclick="App.sendWhatsAppById('${r.id}')">💬 WhatsApp</button>
                    ${r.next ? `<span class="muted">Siguiente: ${r.next}</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    populateQuickResponseFilters() {
        const select = document.getElementById('quick-response-stage');
        if (!select || !Data.stages) return;
        select.innerHTML = `<option value="all">Todas</option>` + Object.entries(Data.stages)
            .map(([id, stage]) => `<option value="${id}">${stage.name}</option>`).join('');
    },

    filterQuickResponses() {
        const stage = this.getInputValue('quick-response-stage') || 'all';
        const query = this.getInputValue('quick-response-search') || '';
        this.renderQuickResponses(stage, query);
    },

    copyResponseById(id) {
        const response = Data.responses[id];
        if (!response) return;
        this.copyToClipboard(response.message);
    },

    sendWhatsAppById(id) {
        const response = Data.responses[id];
        if (!response) return;
        const text = encodeURIComponent(response.message);
        window.open(`https://wa.me/?text=${text}`, '_blank');
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
    renderProductInfoCards() {
        const container = document.getElementById('product-info-cards');
        const info = Data.productInfo || {};
        if (!container) return;

        const desiredOrder = ['disneyCruise', 'royalCaribbean', 'disneyland', 'disneyHotels', 'seasons', 'salesTips'];
        const keys = desiredOrder.filter(k => info[k]).concat(
            Object.keys(info).filter(k => k !== 'wdwParksGuide' && !desiredOrder.includes(k))
        );

        container.innerHTML = keys.map(key => {
            const item = info[key];
            const sections = item.sections?.map(section => `
                <div class="info-section">
                    <div class="info-section-title">${section.title}</div>
                    <div class="info-section-content">${section.content}</div>
                </div>
            `).join('') || '';

            return `
                <div class="info-card open">
                    <div class="info-card-header" onclick="App.toggleInfoCard(this)">
                        <span class="icon">${item.icon || 'ℹ️'}</span>
                        <span class="title">${item.title}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="info-card-body open">
                        ${sections}
                    </div>
                </div>
            `;
        }).join('');
    },

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
document.addEventListener('DOMContentLoaded', async () => {
    if (window.Storage?.init) {
        await Storage.init();
    }
    App.init();
});

// Make App available globally
window.App = App;
