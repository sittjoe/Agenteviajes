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
                    <div class="column-header-top">
                        <span class="column-title">${col.name}</span>
                        <span class="column-count">${stats[col.id].count}</span>
                    </div>
                    <div class="column-total">${App.formatCurrency(stats[col.id].value)}</div>
                </div>
                <div class="column-body" 
                    ondrop="Pipeline_UI.drop(event, '${col.id}')" 
                    ondragover="Pipeline_UI.allowDrop(event)"
                    ondragenter="Pipeline_UI.dragEnter(event)"
                    ondragleave="Pipeline_UI.dragLeave(event)">
                    ${quotesByStage[col.id].map(quote => this.renderCard(quote)).join('')}
                </div>
            </div>
        `).join('');
    },

    renderCard(quote) {
        const urgency = Pipeline.getUrgency(quote);
        const clientName = quote.client?.name || 'Cliente sin nombre';

        return `
            <div class="kanban-card urgency-${urgency}" 
                draggable="true" 
                ondragstart="Pipeline_UI.drag(event, '${quote.id}')" 
                onclick="App.viewQuote('${quote.id}')">
                
                <div class="kanban-card-header">
                    <span class="kanban-client">${clientName}</span>
                    <span class="kanban-id">#${quote.id}</span>
                </div>
                
                <div class="kanban-product">${quote.product || 'Sin producto'}</div>
                
                <div class="kanban-footer">
                    <span class="kanban-price">${App.formatCurrency(quote.total)}</span>
                    <span class="kanban-date">${new Date(quote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                
                ${urgency === 'high' || urgency === 'overdue' ?
                `<div class="urgency-badge ${urgency}">⚠️ ${urgency === 'overdue' ? 'Vencida' : 'Pronto vence'}</div>`
                : ''}
            </div>
        `;
    },

    allowDrop(ev) {
        ev.preventDefault();
    },

    dragEnter(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('drag-over');
    },

    dragLeave(ev) {
        ev.currentTarget.classList.remove('drag-over');
    },

    drag(ev, quoteId) {
        ev.dataTransfer.setData("text", quoteId);
        ev.dataTransfer.effectAllowed = "move";
        // Add a class to the dragged element for styling
        ev.target.classList.add('dragging');
    },

    drop(e) {
        e.preventDefault();
        const column = e.target.closest('.pipeline-column');
        if (column) {
            column.classList.remove('drag-over');
            const quoteId = e.dataTransfer.getData('text/plain');
            const newStage = column.dataset.stage;

            if (quoteId && newStage) {
                Pipeline.moveQuote(quoteId, newStage);
                this.renderBoard();
                App.showToast('✅ Cotización movida', 'success');
                App.playSound('pop'); // Sound effect
            }
        }
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
