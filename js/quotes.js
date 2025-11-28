/**
 * Quotes Module - Sistema de cotizaciones
 * Versión 2.0
 */

// Extend App with quote functionality
Object.assign(App, {

    // ===== QUOTES LIST =====
    showQuotesList() {
        this.renderQuotesList();
        this.switchScreen('tab-cotizar', 'quotes-list');
        this.state.editingQuoteId = null;
        this.state.unsavedChanges = false;
    },

    renderQuotesList() {
        const quotes = Storage.getQuotes();
        const container = document.getElementById('quotes-list-container');

        if (!container) return;

        if (quotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="emoji">📝</span>
                    <p>No hay cotizaciones guardadas</p>
                    <button class="btn-primary" onclick="App.showNewQuote()">
                        ➕ Crear primera cotización
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = quotes.map(q => {
            const type = Data.productTypes[q.type] || Data.productTypes.otro;
            const status = Data.quoteStatuses[q.status] || Data.quoteStatuses.draft;
            const date = this.formatDate(q.createdAt);

            return `
                <div class="quote-item" onclick="App.viewQuote('${q.id}')">
                    <div class="quote-item-icon">${type.icon}</div>
                    <div class="quote-item-info">
                        <div class="quote-item-client">${q.client?.name || 'Sin nombre'}</div>
                        <div class="quote-item-product">${q.product || 'Sin producto'}</div>
                        <div class="quote-item-meta">
                            <span class="quote-status status-${q.status}">${status.icon} ${status.name}</span>
                            <span class="quote-date">${date}</span>
                        </div>
                    </div>
                    <div class="quote-item-price">
                        <div class="price">${this.formatCurrency(q.total || 0)}</div>
                        <div class="quote-id">${q.id}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterQuotes() {
        const query = this.getInputValue('quoteSearch')?.toLowerCase();
        const quotes = Storage.getQuotes();

        const filtered = query
            ? quotes.filter(q =>
                q.client?.name?.toLowerCase().includes(query) ||
                q.product?.toLowerCase().includes(query) ||
                q.id?.toLowerCase().includes(query)
            )
            : quotes;

        const container = document.getElementById('quotes-list-container');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No se encontraron cotizaciones</p></div>';
            return;
        }

        // Re-render with filtered
        container.innerHTML = filtered.map(q => {
            const type = Data.productTypes[q.type] || Data.productTypes.otro;
            const status = Data.quoteStatuses[q.status] || Data.quoteStatuses.draft;

            return `
                <div class="quote-item" onclick="App.viewQuote('${q.id}')">
                    <div class="quote-item-icon">${type.icon}</div>
                    <div class="quote-item-info">
                        <div class="quote-item-client">${q.client?.name || 'Sin nombre'}</div>
                        <div class="quote-item-product">${q.product || 'Sin producto'}</div>
                    </div>
                    <div class="quote-item-price">
                        ${this.formatCurrency(q.total || 0)}
                    </div>
                </div>
            `;
        }).join('');
    },

    // ===== NEW/EDIT QUOTE =====
    showNewQuote() {
        this.state.editingQuoteId = null;
        this.clearQuoteForm();

        // Generate new quote ID
        const newId = Storage.generateQuoteId();
        this.setInputValue('quote-id', newId);

        // Set default validity date
        const config = Storage.getConfig();
        const validDays = config.quotes?.validityDays || 7;
        const validDate = new Date();
        validDate.setDate(validDate.getDate() + validDays);
        this.setInputValue('quote-valid-until', validDate.toISOString().split('T')[0]);

        document.getElementById('quote-form-title').textContent = '📝 Nueva Cotización';
        this.switchScreen('tab-cotizar', 'quote-form');
        this.updateQuotePreview();
    },

    editQuote(id) {
        const quote = Storage.getQuoteById(id);
        if (!quote) {
            this.showToast('Cotización no encontrada', 'error');
            return;
        }

        this.state.editingQuoteId = id;
        this.fillQuoteForm(quote);

        document.getElementById('quote-form-title').textContent = '✏️ Editar Cotización';
        this.switchScreen('tab-cotizar', 'quote-form');
        this.updateQuotePreview();
    },

    clearQuoteForm() {
        // Client
        this.setInputValue('quote-client-name', '');
        this.setInputValue('quote-client-phone', '');
        this.setInputValue('quote-client-email', '');

        // Trip
        this.setInputValue('quote-type', 'crucero-disney');
        this.setInputValue('quote-product', '');
        this.setInputValue('quote-date-start', '');
        this.setInputValue('quote-date-end', '');
        this.setInputValue('quote-adults', '2');
        this.setInputValue('quote-children', '0');
        this.updateChildrenAges();
        this.setInputValue('quote-includes', '');
        this.setInputValue('quote-excludes', '');

        // Pricing
        this.setInputValue('quote-total', '');
        this.setInputValue('quote-deposit', '');
        this.setInputValue('quote-months', '6');
        this.setInputValue('quote-deadline', '');

        // Notes
        this.setInputValue('quote-notes-internal', '');
        this.setInputValue('quote-notes-client', '');

        // Status
        this.setInputValue('quote-status', 'draft');

        this.state.unsavedChanges = false;
    },

    fillQuoteForm(quote) {
        // ID
        this.setInputValue('quote-id', quote.id);

        // Client
        this.setInputValue('quote-client-name', quote.client?.name || '');
        this.setInputValue('quote-client-phone', quote.client?.phone || '');
        this.setInputValue('quote-client-email', quote.client?.email || '');

        // Trip
        this.setInputValue('quote-type', quote.type || 'crucero-disney');
        this.setInputValue('quote-product', quote.product || '');
        this.setInputValue('quote-date-start', quote.dateStart || '');
        this.setInputValue('quote-date-end', quote.dateEnd || '');
        this.setInputValue('quote-adults', quote.adults || '2');
        this.setInputValue('quote-children', quote.children || '0');
        this.updateChildrenAges();
        if (quote.childrenAges) {
            quote.childrenAges.forEach((age, idx) => {
                this.setInputValue(`child-age-${idx}`, age);
            });
        }
        this.setInputValue('quote-includes', quote.includes || '');
        this.setInputValue('quote-excludes', quote.excludes || '');

        // Pricing
        this.setInputValue('quote-total', quote.total || '');
        this.setInputValue('quote-deposit', quote.deposit || '');
        this.setInputValue('quote-months', quote.months || '6');
        this.setInputValue('quote-deadline', quote.deadline || '');

        // Notes
        this.setInputValue('quote-notes-internal', quote.notesInternal || '');
        this.setInputValue('quote-notes-client', quote.notesClient || '');

        // Status
        this.setInputValue('quote-status', quote.status || 'draft');

        // Validity
        this.setInputValue('quote-valid-until', quote.validUntil?.split('T')[0] || '');

        this.calculateMonthly();
        this.state.unsavedChanges = false;
    },

    getQuoteFromForm() {
        const total = parseFloat(this.getInputValue('quote-total')) || 0;
        const deposit = parseFloat(this.getInputValue('quote-deposit')) || 0;
        const months = parseInt(this.getInputValue('quote-months')) || 6;
        const monthly = months > 0 ? Math.ceil((total - deposit) / months) : 0;

        return {
            id: this.getInputValue('quote-id') || Storage.generateQuoteId(),
            status: this.getInputValue('quote-status') || 'draft',

            client: {
                name: this.getInputValue('quote-client-name'),
                phone: this.getInputValue('quote-client-phone'),
                email: this.getInputValue('quote-client-email')
            },

            type: this.getInputValue('quote-type'),
            product: this.getInputValue('quote-product'),
            dateStart: this.getInputValue('quote-date-start'),
            dateEnd: this.getInputValue('quote-date-end'),
            adults: parseInt(this.getInputValue('quote-adults')) || 2,
            children: parseInt(this.getInputValue('quote-children')) || 0,
            childrenAges: this.getChildrenAges(),
            dates: this.formatDateRange(),
            travelers: this.formatTravelers(),
            includes: this.getInputValue('quote-includes'),
            excludes: this.getInputValue('quote-excludes'),

            total: total,
            deposit: deposit,
            months: months,
            monthly: monthly,
            deadline: this.getInputValue('quote-deadline'),

            notesInternal: this.getInputValue('quote-notes-internal'),
            notesClient: this.getInputValue('quote-notes-client'),

            validUntil: this.getInputValue('quote-valid-until')
        };
    },

    markQuoteChanged() {
        this.state.unsavedChanges = true;
    },

    validateQuote(quote) {
        const errors = [];

        if (!quote.client?.name?.trim()) {
            errors.push('Nombre del cliente es requerido');
        }
        if (!quote.product?.trim()) {
            errors.push('Producto/Destino es requerido');
        }
        if (!quote.total || quote.total <= 0) {
            errors.push('Precio total debe ser mayor a 0');
        }

        return errors;
    },

    saveQuote() {
        const quote = this.getQuoteFromForm();
        const errors = this.validateQuote(quote);

        if (errors.length > 0) {
            this.showToast('⚠️ ' + errors[0], 'warning');
            return false;
        }

        // Preserve original data if editing
        if (this.state.editingQuoteId) {
            const original = Storage.getQuoteById(this.state.editingQuoteId);
            if (original) {
                quote.createdAt = original.createdAt;
            }
        }

        Storage.saveQuote(quote);
        Storage.incrementStat('quotesCreated');

        this.state.unsavedChanges = false;
        this.showToast('💾 Cotización guardada', 'success');
        this.showQuotesList();

        return true;
    },

    // ===== VIEW QUOTE =====
    viewQuote(id) {
        const quote = Storage.getQuoteById(id);
        if (!quote) {
            this.showToast('Cotización no encontrada', 'error');
            return;
        }

        this.state.viewingQuoteId = id;

        const type = Data.productTypes[quote.type] || Data.productTypes.otro;
        const status = Data.quoteStatuses[quote.status] || Data.quoteStatuses.draft;
        const config = Storage.getConfig();

        // Calculate monthly
        const monthly = quote.months > 0 ? Math.ceil((quote.total - quote.deposit) / quote.months) : 0;

        // Format includes/excludes
        const includesList = quote.includes?.split('\n').filter(i => i.trim()).map(i => `<li>${i.trim()}</li>`).join('') || '';
        const excludesList = quote.excludes?.split('\n').filter(i => i.trim()).map(i => `<li>${i.trim()}</li>`).join('') || '';

        document.getElementById('view-quote-content').innerHTML = `
            <div class="quote-view-header">
                <div class="quote-view-id">${quote.id}</div>
                <div class="quote-view-status status-${quote.status}">${status.icon} ${status.name}</div>
            </div>
            
            <div class="card">
                <div class="card-title">👤 Cliente</div>
                <p><strong>${quote.client?.name || 'Sin nombre'}</strong></p>
                ${quote.client?.phone ? `<p>📱 ${quote.client.phone}</p>` : ''}
                ${quote.client?.email ? `<p>📧 ${quote.client.email}</p>` : ''}
            </div>
            
            <div class="card">
                <div class="card-title">${type.icon} Viaje</div>
                <p><strong>${quote.product || 'Sin producto'}</strong></p>
                ${quote.dates ? `<p>📅 ${quote.dates}</p>` : ''}
                ${quote.travelers ? `<p>👥 ${quote.travelers}</p>` : ''}
            </div>
            
            ${includesList ? `
            <div class="card">
                <div class="card-title">✅ Incluye</div>
                <ul class="includes-list">${includesList}</ul>
            </div>
            ` : ''}
            
            ${excludesList ? `
            <div class="card">
                <div class="card-title">❌ No incluye</div>
                <ul class="excludes-list">${excludesList}</ul>
            </div>
            ` : ''}
            
            <div class="card pricing-card">
                <div class="card-title">💰 Inversión</div>
                <div class="price-big">${this.formatCurrency(quote.total)}</div>
                <div class="price-details">
                    <p>Apartado: <strong>${this.formatCurrency(quote.deposit)}</strong></p>
                    <p>${quote.months} pagos de: <strong>${this.formatCurrency(monthly)}/mes</strong></p>
                    ${quote.deadline ? `<p>Pago final: <strong>${quote.deadline}</strong></p>` : ''}
                </div>
            </div>
            
            ${quote.notesClient ? `
            <div class="card">
                <div class="card-title">📝 Notas</div>
                <p>${quote.notesClient}</p>
            </div>
            ` : ''}
            
            <div class="quote-view-footer">
                <p>📱 WhatsApp: ${config.business?.phone || '55 8095 5139'}</p>
                <p class="legal-text">${config.quotes?.legalText || ''}</p>
            </div>
        `;

        this.switchScreen('tab-cotizar', 'quote-view');
    },

    // ===== QUOTE ACTIONS =====
    copyQuoteText() {
        const quote = this.getQuoteFromForm();
        const text = this.generateQuoteText(quote);
        this.copyToClipboard(text);
    },

    copyCurrentQuoteText() {
        const quote = Storage.getQuoteById(this.state.viewingQuoteId);
        if (quote) {
            const text = this.generateQuoteText(quote);
            this.copyToClipboard(text);
        }
    },

    generateQuoteText(quote) {
        const config = Storage.getConfig();
        const type = Data.productTypes[quote.type] || Data.productTypes.otro;
        const monthly = quote.months > 0 ? Math.ceil((quote.total - quote.deposit) / quote.months) : 0;

        let text = `¡Hola ${quote.client?.name || ''}! 👋

Aquí está tu cotización ✨

${type.icon} ${quote.product || ''}
📅 ${quote.dates || ''}
👥 ${quote.travelers || ''}`;

        if (quote.includes) {
            text += `

✅ INCLUYE:
${quote.includes.split('\n').filter(i => i.trim()).map(i => '• ' + i.trim()).join('\n')}`;
        }

        if (quote.excludes) {
            text += `

❌ NO INCLUYE:
${quote.excludes.split('\n').filter(i => i.trim()).map(i => '• ' + i.trim()).join('\n')}`;
        }

        text += `

💰 INVERSIÓN TOTAL: ${this.formatCurrency(quote.total)}

💳 Para apartar: ${this.formatCurrency(quote.deposit)}
📅 ${quote.months} pagos de: ${this.formatCurrency(monthly)}/mes`;

        if (quote.deadline) {
            text += `
⏰ Pago final antes de: ${quote.deadline}`;
        }

        if (quote.notesClient) {
            text += `

📝 ${quote.notesClient}`;
        }

        text += `

📱 WhatsApp: ${config.business?.phone || '55 8095 5139'}
✨ Magia Disney & Royal

Cotización ${quote.id} • Válida ${config.quotes?.validityDays || 7} días
${config.quotes?.legalText || ''}`;

        return text;
    },

    sendQuoteWhatsApp() {
        const quote = this.state.viewingQuoteId
            ? Storage.getQuoteById(this.state.viewingQuoteId)
            : this.getQuoteFromForm();

        if (!quote) return;

        const text = encodeURIComponent(this.generateQuoteText(quote));
        const phone = quote.client?.phone?.replace(/\D/g, '');

        if (phone) {
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
        } else {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        }

        // Update status to sent
        if (this.state.viewingQuoteId) {
            quote.status = 'sent';
            Storage.saveQuote(quote);
            Storage.incrementStat('quotesSent');
        }
    },

    duplicateQuote() {
        const quote = Storage.getQuoteById(this.state.viewingQuoteId);
        if (!quote) return;

        // Create copy with new ID
        const newQuote = { ...quote };
        newQuote.id = Storage.generateQuoteId();
        newQuote.status = 'draft';
        newQuote.createdAt = new Date().toISOString();
        newQuote.updatedAt = newQuote.createdAt;

        this.state.editingQuoteId = null;
        this.fillQuoteForm(newQuote);
        this.setInputValue('quote-id', newQuote.id);

        document.getElementById('quote-form-title').textContent = '📋 Duplicar Cotización';
        this.switchScreen('tab-cotizar', 'quote-form');

        this.showToast('📋 Cotización duplicada', 'success');
    },

    deleteQuote() {
        if (!this.state.viewingQuoteId) return;

        this.showModal(
            'Eliminar cotización',
            '¿Estás seguro de eliminar esta cotización? Esta acción no se puede deshacer.',
            () => {
                Storage.deleteQuote(this.state.viewingQuoteId);
                this.showToast('🗑️ Cotización eliminada', 'success');
                this.showQuotesList();
            }
        );
    },

    updateQuoteStatus(newStatus) {
        const quote = Storage.getQuoteById(this.state.viewingQuoteId);
        if (!quote) return;

        quote.status = newStatus;
        Storage.saveQuote(quote);

        if (newStatus === 'accepted') {
            Storage.incrementStat('quotesAccepted');
            Storage.incrementStat('totalValue', quote.total);
        }

        this.showToast('✅ Estado actualizado', 'success');
        this.viewQuote(quote.id);
    },

    // ===== QUOTE PREVIEW =====
    updateQuotePreview() {
        const quote = this.getQuoteFromForm();
        const preview = document.getElementById('quote-preview');
        if (!preview) return;

        const type = Data.productTypes[quote.type] || Data.productTypes.otro;
        const monthly = quote.months > 0 ? Math.ceil((quote.total - quote.deposit) / quote.months) : 0;

        let html = `<div class="preview-header">${type.icon} Cotización ${quote.id}</div>`;

        if (quote.client?.name) {
            html += `<p><strong>👤 ${quote.client.name}</strong></p>`;
        }

        if (quote.product) {
            html += `<p>${quote.product}</p>`;
        }

        if (quote.dates) {
            html += `<p>📅 ${quote.dates}</p>`;
        }

        if (quote.travelers) {
            html += `<p>👥 ${quote.travelers}</p>`;
        }

        if (quote.total > 0) {
            html += `
                <div class="preview-price">
                    <div class="price-main">${this.formatCurrency(quote.total)}</div>
                    <div class="price-sub">Apartado: ${this.formatCurrency(quote.deposit)} • ${quote.months} pagos de ${this.formatCurrency(monthly)}/mes</div>
                </div>
            `;
        }

        preview.innerHTML = html || '<p class="preview-empty">Llena los campos para ver la vista previa...</p>';
    },

    calculateMonthly() {
        const total = parseFloat(this.getInputValue('quote-total')) || 0;
        const deposit = parseFloat(this.getInputValue('quote-deposit')) || 0;
        const months = parseInt(this.getInputValue('quote-months')) || 6;

        const monthly = months > 0 ? Math.ceil((total - deposit) / months) : 0;

        const display = document.getElementById('monthly-display');
        if (display) {
            display.textContent = this.formatCurrency(monthly) + '/mes';
        }

        this.updateQuotePreview();
    },

    // ===== HELPER FUNCTIONS FOR NEW FIELDS =====
    updateChildrenAges() {
        const numChildren = parseInt(this.getInputValue('quote-children')) || 0;
        const container = document.getElementById('children-ages-container');
        if (!container) return;

        if (numChildren === 0) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="form-group"><label class="form-label">Edades de los niños</label><div class="form-row">';
        for (let i = 0; i < numChildren; i++) {
            html += `
                <div class="form-group">
                    <select id="child-age-${i}" class="form-select" onchange="App.markQuoteChanged();App.updateQuotePreview()">
                        <option value="">Niño ${i + 1}</option>
                        <option value="0">Bebé (&lt;1)</option>
                        <option value="1">1 año</option>
                        <option value="2">2 años</option>
                        <option value="3">3 años</option>
                        <option value="4">4 años</option>
                        <option value="5">5 años</option>
                        <option value="6">6 años</option>
                        <option value="7">7 años</option>
                        <option value="8">8 años</option>
                        <option value="9">9 años</option>
                        <option value="10">10 años</option>
                        <option value="11">11 años</option>
                        <option value="12">12 años</option>
                        <option value="13">13 años</option>
                        <option value="14">14 años</option>
                        <option value="15">15 años</option>
                        <option value="16">16 años</option>
                        <option value="17">17 años</option>
                    </select>
                </div>
            `;
        }
        html += '</div></div>';
        container.innerHTML = html;
    },

    getChildrenAges() {
        const numChildren = parseInt(this.getInputValue('quote-children')) || 0;
        const ages = [];
        for (let i = 0; i < numChildren; i++) {
            const age = this.getInputValue(`child-age-${i}`);
            if (age !== '') {
                ages.push(parseInt(age));
            }
        }
        return ages;
    },

    formatDateRange() {
        const start = this.getInputValue('quote-date-start');
        const end = this.getInputValue('quote-date-end');

        if (!start && !end) return '';
        if (!end) return this.formatDate(start);
        if (!start) return this.formatDate(end);

        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T00:00:00');

        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const startMonth = months[startDate.getMonth()];
        const endMonth = months[endDate.getMonth()];
        const year = endDate.getFullYear();

        if (startMonth === endMonth) {
            return `${startDay}-${endDay} ${startMonth} ${year}`;
        } else {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
        }
    },

    formatTravelers() {
        const adults = parseInt(this.getInputValue('quote-adults')) || 0;
        const children = parseInt(this.getInputValue('quote-children')) || 0;
        const childrenAges = this.getChildrenAges();

        let parts = [];
        if (adults > 0) {
            parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
        }
        if (children > 0) {
            if (childrenAges.length > 0) {
                parts.push(`${children} niño${children !== 1 ? 's' : ''} (${childrenAges.join(', ')} años)`);
            } else {
                parts.push(`${children} niño${children !== 1 ? 's' : ''}`);
            }
        }

        return parts.join(', ') || '';
    },

    // ===== MODAL =====
    showModal(title, body, onConfirm, infoOnly = false) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalConfirm = document.getElementById('modal-confirm');
        const modalOverlay = document.getElementById('modal-overlay');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = body; // Use innerHTML to support HTML content
        
        if (modalConfirm) {
            if (infoOnly || !onConfirm) {
                modalConfirm.style.display = 'none';
            } else {
                modalConfirm.style.display = '';
                modalConfirm.onclick = () => {
                    const result = onConfirm();
                    if (result !== false) {
                        this.closeModal();
                    }
                };
            }
        }
        
        if (modalOverlay) modalOverlay.classList.add('show');
    },

    closeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalConfirm = document.getElementById('modal-confirm');
        if (modalOverlay) modalOverlay.classList.remove('show');
        if (modalConfirm) modalConfirm.style.display = ''; // Reset display
    }
});
