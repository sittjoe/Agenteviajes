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

        container.innerHTML = clients.map(client => `
            <div class="client-card" onclick="CRM_UI.showClientDetails('${client.id}')">
                <div class="client-info">
                    <h3>${client.name}</h3>
                    <div class="client-meta">
                        <span>📧 ${client.email || 'Sin email'}</span>
                        <span>📱 ${client.phone || 'Sin teléfono'}</span>
                    </div>
                </div>
                <div class="client-tags">
                    <span class="tag ${client.status}">${client.status.toUpperCase()}</span>
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

        // Simple alert for now, can be expanded to a full modal or view
        alert(`Detalles de ${client.name}\nEmail: ${client.email}\nTel: ${client.phone}\nEstado: ${client.status}`);
    }
};

const Pipeline_UI = {
    init() {
        this.renderBoard();
    },

    renderBoard() {
        const container = document.getElementById('pipeline-board');
        if (!container) return;

        const quotesByStage = Pipeline.getQuotesByStage();
        const stats = Pipeline.getColumnStats();

        container.innerHTML = Pipeline.columns.map(col => `
            <div class="pipeline-column" data-stage="${col.id}">
                <div class="column-header" style="border-top: 3px solid ${col.color}">
                    <span>${col.name}</span>
                    <span class="column-count">${stats[col.id].count}</span>
                </div>
                <div class="column-body" ondrop="Pipeline_UI.drop(event, '${col.id}')" ondragover="Pipeline_UI.allowDrop(event)">
                    ${quotesByStage[col.id].map(quote => this.renderCard(quote)).join('')}
                </div>
            </div>
        `).join('');
    },

    renderCard(quote) {
        const urgency = Pipeline.getUrgency(quote);
        return `
            <div class="kanban-card" draggable="true" ondragstart="Pipeline_UI.drag(event, '${quote.id}')" onclick="App.viewQuote('${quote.id}')">
                <div class="card-title">${quote.client?.name || 'Cliente sin nombre'}</div>
                <div class="card-amount">${App.formatCurrency(quote.total)}</div>
                <div class="card-meta">
                    <span>${quote.product || 'Sin producto'}</span>
                    <span><span class="urgency-indicator urgency-${urgency}"></span>${new Date(quote.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    },

    allowDrop(ev) {
        ev.preventDefault();
    },

    drag(ev, quoteId) {
        ev.dataTransfer.setData("text", quoteId);
    },

    drop(ev, newStage) {
        ev.preventDefault();
        const quoteId = ev.dataTransfer.getData("text");

        Pipeline.moveQuote(quoteId, newStage);
        this.renderBoard();
        App.showToast('Cotización movida', 'success');
    }
};

// Hook into App.switchTab to render views when accessed
const originalSwitchTab = App.switchTab;
App.switchTab = function (tabId) {
    originalSwitchTab.call(this, tabId);

    if (tabId === 'crm') {
        CRM_UI.init();
    } else if (tabId === 'pipeline') {
        Pipeline_UI.init();
    }
};
