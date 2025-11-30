/**
 * UI Controller for CRM and Pipeline
 * Handles rendering and user interactions for the new views
 */

const CRM_UI = {
    init() {
        this.renderClientList();
    },

    renderClientList(query = '') {
        const container = document.getElementById('client-list-container');
        if (!container) return;

        const clients = query ? CRM.searchClients(query) : CRM.getClients();

        if (clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px;">👥</div>
                    <h3>No hay clientes aún</h3>
                    <p>Agrega tu primer cliente para comenzar a gestionarlos.</p>
                </div>
            `;
            return;
        }

        // Sort by most recent update
        clients.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        container.innerHTML = clients.map(client => `
            <div class="client-card" onclick="CRM_UI.showClientDetails('${client.id}')">
                <div class="client-header-row">
                    <div class="client-avatar">${client.name.charAt(0).toUpperCase()}</div>
                    <div class="client-info">
                        <h3>${client.name}</h3>
                        <div class="client-meta">
                            ${client.email ? `<span>📧 ${client.email}</span>` : ''}
                            ${client.phone ? `<span>📱 ${client.phone}</span>` : ''}
                        </div>
                    </div>
                    <div class="client-status-badge ${client.status}">${client.status.toUpperCase()}</div>
                </div>
                <div class="client-tags">
                    ${client.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
    },

    showAddClientModal() {
        App.showModal(
            'Nuevo Cliente',
            `
            <div class="form-group">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="new-client-name" class="form-input" placeholder="Ej. Familia Pérez">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="new-client-email" class="form-input" placeholder="cliente@email.com">
            </div>
            <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" id="new-client-phone" class="form-input" placeholder="55 1234 5678">
            </div>
            <div class="form-group">
                <label class="form-label">Estado</label>
                <select id="new-client-status" class="form-select">
                    <option value="lead">Lead (Potencial)</option>
                    <option value="cliente">Cliente Activo</option>
                    <option value="vip">VIP</option>
                </select>
            </div>
            `,
            () => {
                const name = document.getElementById('new-client-name').value;
                const email = document.getElementById('new-client-email').value;
                const phone = document.getElementById('new-client-phone').value;
                const status = document.getElementById('new-client-status').value;

                if (!name) {
                    App.showToast('El nombre es requerido', 'error');
                    return false; // Prevent closing
                }

                CRM.createClient({ name, email, phone, status });
                App.showToast('Cliente creado exitosamente', 'success');
                this.renderClientList();
                return true; // Close modal
            }
        );
    },

    showClientDetails(clientId) {
        const client = CRM.getClientById(clientId);
        if (!client) return;

        const quotes = CRM.getClientQuotes(clientId);
        const timeline = client.timeline || [];

        const content = `
            <div class="client-profile-header">
                <div class="client-avatar-large">${client.name.charAt(0).toUpperCase()}</div>
                <h2>${client.name}</h2>
                <div class="client-badges">
                    <span class="client-status-badge ${client.status}">${client.status.toUpperCase()}</span>
                </div>
            </div>

            <div class="client-contact-info">
                <div class="contact-item">
                    <span class="icon">📧</span>
                    <a href="mailto:${client.email}">${client.email || 'Sin email'}</a>
                </div>
                <div class="contact-item">
                    <span class="icon">📱</span>
                    <a href="tel:${client.phone}">${client.phone || 'Sin teléfono'}</a>
                </div>
                <div class="contact-item">
                    <span class="icon">📅</span>
                    <span>Cliente desde ${new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="client-tabs">
                <button class="client-tab active" onclick="CRM_UI.switchClientTab('timeline')">Historial</button>
                <button class="client-tab" onclick="CRM_UI.switchClientTab('quotes')">Cotizaciones (${quotes.length})</button>
            </div>

            <div id="client-tab-timeline" class="client-tab-content active">
                <div class="timeline-list">
                    ${timeline.map(event => `
                        <div class="timeline-item">
                            <div class="timeline-icon ${event.type}">●</div>
                            <div class="timeline-content">
                                <div class="timeline-desc">${event.description}</div>
                                <div class="timeline-date">${new Date(event.date).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="client-tab-quotes" class="client-tab-content">
                ${quotes.length > 0 ? quotes.map(q => `
                    <div class="mini-quote-card" onclick="App.viewQuote('${q.id}'); App.closeModal()">
                        <div class="mini-quote-header">
                            <span class="mini-quote-id">#${q.id}</span>
                            <span class="mini-quote-status ${q.status}">${q.status}</span>
                        </div>
                        <div class="mini-quote-product">${q.product}</div>
                        <div class="mini-quote-total">${App.formatCurrency(q.total)}</div>
                    </div>
                `).join('') : '<p class="empty-text">Sin cotizaciones</p>'}
            </div>
            
            <div class="modal-actions-footer">
                 <button class="btn-secondary btn-sm" onclick="CRM_UI.editClient('${client.id}')">✏️ Editar</button>
                 <button class="btn-danger btn-sm" onclick="CRM_UI.deleteClient('${client.id}')">🗑️ Eliminar</button>
            </div>
        `;

        App.showModal('Detalle de Cliente', content, null, true); // true for "info only" (no confirm button)
    },

    switchClientTab(tabName) {
        document.querySelectorAll('.client-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.client-tab-content').forEach(c => c.classList.remove('active'));

        // Find the button that was clicked (this is a bit hacky without event target, but works if unique text)
        // Better: rely on the onclick to pass 'this' or just toggle classes based on index
        // For now, let's just use the tabName to find the button if possible, or just toggle contents

        const buttons = document.querySelectorAll('.client-tab');
        if (tabName === 'timeline') buttons[0].classList.add('active');
        if (tabName === 'quotes') buttons[1].classList.add('active');

        document.getElementById(`client-tab-${tabName}`).classList.add('active');
    },

    deleteClient(clientId) {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            CRM.deleteClient(clientId);
            App.closeModal();
            this.renderClientList();
            App.showToast('Cliente eliminado', 'success');
        }
    },

    editClient(clientId) {
        // Placeholder for edit functionality
        alert('Editar cliente: ' + clientId);
    }
};

const Pipeline_UI = {
    init() {
        this.renderQuotesList();
    },

    renderQuotesList() {
        const container = document.getElementById('pipeline-quotes-list');
        if (!container) return;

        const quotes = Storage.getQuotes ? Storage.getQuotes() : [];
        const stats = Pipeline.getColumnStats ? Pipeline.getColumnStats() : {};

        if (quotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                    <h3>No hay cotizaciones</h3>
                    <p>Crea una cotización para verla en el pipeline.</p>
                    <button class="btn-primary" onclick="App.showTab('cotizar'); App.showNewQuote();">➕ Nueva cotización</button>
                </div>
            `;
            return;
        }

        // Group by status
        const groupedQuotes = {
            draft: quotes.filter(q => q.status === 'draft'),
            sent: quotes.filter(q => q.status === 'sent'),
            negotiating: quotes.filter(q => q.status === 'negotiating'),
            accepted: quotes.filter(q => q.status === 'accepted'),
            rejected: quotes.filter(q => q.status === 'rejected')
        };

        const statusLabels = {
            draft: { name: 'Borrador', color: '#94a3b8', icon: '📝' },
            sent: { name: 'Enviada', color: '#3b82f6', icon: '📤' },
            negotiating: { name: 'Negociando', color: '#f59e0b', icon: '💬' },
            accepted: { name: 'Aceptada', color: '#10b981', icon: '✅' },
            rejected: { name: 'Rechazada', color: '#ef4444', icon: '❌' }
        };

        container.innerHTML = Object.entries(statusLabels).map(([status, info]) => {
            const statusQuotes = groupedQuotes[status] || [];
            const totalValue = statusQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

            return `
                <div class="pipeline-section">
                    <div class="pipeline-section-header" style="border-left: 4px solid ${info.color}">
                        <span class="pipeline-status-icon">${info.icon}</span>
                        <span class="pipeline-status-name">${info.name}</span>
                        <span class="pipeline-status-count">${statusQuotes.length}</span>
                        <span class="pipeline-status-total">${this.formatCurrency(totalValue)}</span>
                    </div>
                    <div class="pipeline-section-quotes">
                        ${statusQuotes.length > 0 ? statusQuotes.map(quote => this.renderQuoteCard(quote)).join('') : '<p class="empty-text">Sin cotizaciones</p>'}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderQuoteCard(quote) {
        const clientName = quote.client?.name || 'Cliente sin nombre';
        const urgency = Pipeline.getUrgency ? Pipeline.getUrgency(quote) : 'low';

        return `
            <div class="pipeline-quote-card urgency-${urgency}" onclick="App.viewQuote('${quote.id}')">
                <div class="pipeline-quote-header">
                    <span class="pipeline-quote-client">${clientName}</span>
                    <span class="pipeline-quote-id">#${quote.id}</span>
                </div>
                <div class="pipeline-quote-product">${quote.product || 'Sin producto'}</div>
                <div class="pipeline-quote-footer">
                    <span class="pipeline-quote-price">${this.formatCurrency(quote.total)}</span>
                    <span class="pipeline-quote-date">${new Date(quote.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}</span>
                </div>
                ${urgency === 'high' || urgency === 'overdue' ?
                `<div class="urgency-badge ${urgency}">⚠️ ${urgency === 'overdue' ? 'Vencida' : 'Pronto vence'}</div>`
                : ''}
            </div>
        `;
    },

    formatCurrency(value) {
        if (typeof App !== 'undefined' && App.formatCurrency) {
            return App.formatCurrency(value);
        }
        return '$' + (value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
};

/**
 * Extend App.switchTab to update tools nav buttons
 * App.switchTab is already defined in app.js, we just add UI updates here
 */
function initToolsNavUpdates() {
    if (typeof App === 'undefined') return;

    // Store original switchTab
    const originalSwitchTab = App.switchTab;

    App.switchTab = function (viewId) {
        // Call original implementation first
        if (typeof originalSwitchTab === 'function') {
            originalSwitchTab.call(App, viewId);
        }

        // Update tools nav buttons active state
        const navButtons = document.querySelectorAll('.tools-nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            }
        });

        // Handle special case for tools-main (default view)
        if (viewId === 'tools-main') {
            const toolsMain = document.getElementById('view-tools-main');
            if (toolsMain) toolsMain.style.display = 'block';
        }
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolsNavUpdates);
} else {
    initToolsNavUpdates();
}

// Make globally available
window.CRM_UI = CRM_UI;
window.Pipeline_UI = Pipeline_UI;
