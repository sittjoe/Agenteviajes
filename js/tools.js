/**
 * Tools Module - Calculadora, Checklist, PDF, Stats
 * Versión 2.0
 */

// Extend App with tools functionality
Object.assign(App, {
    
    // ===== CALCULATOR =====
    calculatePayment() {
        const total = parseFloat(this.getInputValue('calc-total')) || 0;
        const deposit = parseFloat(this.getInputValue('calc-deposit')) || 0;
        const months = Math.max(1, parseInt(this.getInputValue('calc-months')) || 1);
        
        const remaining = Math.max(0, total - deposit);
        const monthly = months > 0 ? Math.ceil(remaining / months) : 0;
        
        // Update display
        document.getElementById('calc-result').textContent = this.formatCurrency(monthly);
        document.getElementById('calc-months-label').textContent = months + ' meses';
        
        // Update slider visual
        const slider = document.getElementById('calc-months');
        if (slider) {
            const percent = ((months - 1) / 11) * 100;
            slider.style.background = `linear-gradient(to right, var(--primary) ${percent}%, var(--border) ${percent}%)`;
        }
    },
    
    copyCalcResult() {
        const total = parseFloat(this.getInputValue('calc-total')) || 0;
        const deposit = parseFloat(this.getInputValue('calc-deposit')) || 0;
        const months = Math.max(1, parseInt(this.getInputValue('calc-months')) || 1);
        const remaining = Math.max(0, total - deposit);
        const monthly = months > 0 ? Math.ceil(remaining / months) : 0;
        
        const text = `💰 Plan de pagos

Precio total: ${this.formatCurrency(total)}
Apartado: ${this.formatCurrency(deposit)}
Restante: ${this.formatCurrency(remaining)}

📅 ${months} pagos de ${this.formatCurrency(monthly)}/mes

¿Te funciona este plan? 😊`;
        
        this.copyToClipboard(text);
    },
    
    // ===== CHECKLIST =====
    loadChecklist() {
        const saved = Storage.getChecklist();
        document.querySelectorAll('.checklist-item').forEach(item => {
            const id = item.dataset.id;
            if (id && saved[id]) {
                item.classList.add('checked');
            }
        });
    },
    
    toggleCheckItem(element) {
        element.classList.toggle('checked');
        
        // Save state
        const checklist = {};
        document.querySelectorAll('.checklist-item').forEach(item => {
            const id = item.dataset.id;
            if (id) {
                checklist[id] = item.classList.contains('checked');
            }
        });
        Storage.saveChecklist(checklist);
    },
    
    resetChecklist() {
        document.querySelectorAll('.checklist-item').forEach(item => {
            item.classList.remove('checked');
        });
        Storage.saveChecklist({});
        this.showToast('🔄 Checklist reiniciado', 'success');
    },
    
    copyChecklist() {
        const items = Array.from(document.querySelectorAll('.checklist-item'))
            .map(item => {
                const checked = item.classList.contains('checked');
                const text = item.querySelector('.checklist-text')?.textContent || '';
                return `${checked ? '✅' : '⬜'} ${text}`;
            })
            .join('\n');
        
        const text = `📋 Datos pendientes del cliente:\n\n${items}`;
        this.copyToClipboard(text);
    },

    // ===== CLIENT TRAVEL CHECKLIST =====
    loadClientChecklist() {
        const saved = Storage.getClientChecklist();
        document.querySelectorAll('.client-checklist-item').forEach(item => {
            const id = item.dataset.id;
            if (id && saved[id]) {
                item.classList.add('checked');
            }
        });
    },

    toggleClientCheckItem(element) {
        element.classList.toggle('checked');

        const checklist = {};
        document.querySelectorAll('.client-checklist-item').forEach(item => {
            const id = item.dataset.id;
            if (id) checklist[id] = item.classList.contains('checked');
        });
        Storage.saveClientChecklist(checklist);
    },

    resetClientChecklist() {
        document.querySelectorAll('.client-checklist-item').forEach(item => item.classList.remove('checked'));
        Storage.saveClientChecklist({});
        this.showToast('🔄 Checklist de viaje reiniciado', 'success');
    },

    copyClientChecklist() {
        const items = Array.from(document.querySelectorAll('.client-checklist-item'))
            .map(item => {
                const checked = item.classList.contains('checked');
                const text = item.querySelector('.checklist-text')?.textContent || '';
                return `${checked ? '✅' : '⬜'} ${text}`;
            })
            .join('\n');

        const text = `📋 Checklist de viaje para el cliente:\n\n${items}\n\nEstoy al pendiente para ayudarte con cada paso.`;
        this.copyToClipboard(text);
    },

    // ===== REMINDERS =====
    renderReminders() {
        const list = document.getElementById('reminders-list');
        if (!list) return;
        const reminders = Storage.get('reminders') || [];

        if (reminders.length === 0) {
            list.innerHTML = '<p class="muted">Sin recordatorios. Agrega uno nuevo.</p>';
            return;
        }

        list.innerHTML = reminders.map((r, idx) => `
            <div class="reminder-item">
                <div>
                    <div><strong>${r.title}</strong></div>
                    <div class="reminder-meta">${r.typeIcon || '⏰'} ${r.typeLabel || ''} • ${r.date || ''}</div>
                    ${r.message ? `<div class="muted">${r.message}</div>` : ''}
                </div>
                <button class="btn-secondary btn-sm" onclick="App.copyReminder(${idx})">📋 Copiar</button>
                <button class="btn-danger btn-sm" onclick="App.deleteReminder(${idx})">🗑️</button>
            </div>
        `).join('');
    },

    addReminder() {
        const title = prompt('Título del recordatorio (ej. Pago final, Check-in):');
        if (!title) return;
        const date = prompt('Fecha o vencimiento (ej. 2024-06-15 o \"en 7 días\"):', '') || '';
        const typeLabel = prompt('Tipo (ej. Pago, Check-in, FastPass):', '') || '';
        const message = prompt('Mensaje (usa {cliente}, {total}, {fecha} si quieres merge):', '') || '';

        const reminder = {
            title,
            date,
            typeLabel,
            typeIcon: this.inferReminderIcon(typeLabel),
            message
        };

        const reminders = Storage.get('reminders') || [];
        reminders.unshift(reminder);
        Storage.set('reminders', reminders.slice(0, 50));

        this.renderReminders();
    },

    copyReminder(idx) {
        const reminders = Storage.get('reminders') || [];
        const r = reminders[idx];
        if (!r) return;

        const msg = this.buildResponseMessage({ message: r.message || r.title });
        this.copyToClipboard(`⏰ ${r.title}\n${r.date ? `📅 ${r.date}\n` : ''}${msg}`);
    },

    deleteReminder(idx) {
        const reminders = Storage.get('reminders') || [];
        reminders.splice(idx, 1);
        Storage.set('reminders', reminders);
        this.renderReminders();
    },

    inferReminderIcon(typeLabel) {
        const t = (typeLabel || '').toLowerCase();
        if (t.includes('pago')) return '💳';
        if (t.includes('check')) return '✅';
        if (t.includes('fast') || t.includes('lightning')) return '⚡';
        if (t.includes('vuelo')) return '✈️';
        return '⏰';
    },
    
    // ===== STATS =====
    updateStats() {
        const stats = Storage.getStats();
        const quotes = Storage.getQuotes();
        
        // Calculate real-time stats
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const quotesThisMonth = quotes.filter(q => new Date(q.createdAt) >= thisMonth);
        const acceptedThisMonth = quotesThisMonth.filter(q => q.status === 'accepted');
        const valueThisMonth = acceptedThisMonth.reduce((sum, q) => sum + (q.total || 0), 0);
        
        // By status
        const byStatus = {
            draft: quotes.filter(q => q.status === 'draft').length,
            sent: quotes.filter(q => q.status === 'sent').length,
            negotiating: quotes.filter(q => q.status === 'negotiating').length,
            accepted: quotes.filter(q => q.status === 'accepted').length,
            rejected: quotes.filter(q => q.status === 'rejected').length
        };
        
        // Conversion rate
        const totalSent = quotes.filter(q => ['sent', 'negotiating', 'accepted', 'rejected'].includes(q.status)).length;
        const conversionRate = totalSent > 0 ? ((byStatus.accepted / totalSent) * 100).toFixed(1) : 0;
        
        // By product type
        const byType = {};
        quotes.forEach(q => {
            const type = q.type || 'otro';
            byType[type] = (byType[type] || 0) + 1;
        });
        
        // Update UI
        this.setStatValue('stat-total-quotes', quotes.length);
        this.setStatValue('stat-month-quotes', quotesThisMonth.length);
        this.setStatValue('stat-accepted', byStatus.accepted);
        this.setStatValue('stat-conversion', conversionRate + '%');
        this.setStatValue('stat-value', this.formatCurrency(valueThisMonth));
        this.setStatValue('stat-pending', byStatus.draft + byStatus.sent + byStatus.negotiating);

        // Home overview
        this.setStatValue('home-total-quotes', quotes.length);
        this.setStatValue('home-accepted', byStatus.accepted);
        this.setStatValue('home-conversion', conversionRate + '%');
        this.setStatValue('home-pending', byStatus.draft + byStatus.sent + byStatus.negotiating);

        const insight = this.buildInsightMessage(byStatus, Number(conversionRate), quotesThisMonth.length);
        const insightEl = document.getElementById('home-insight');
        if (insightEl) insightEl.textContent = insight;

        // Render charts if containers exist
        this.renderStatusChart(byStatus);
        this.renderTypeChart(byType);
    },
    
    setStatValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    buildInsightMessage(byStatus, conversionRate, quotesThisMonth) {
        const pending = byStatus.draft + byStatus.sent + byStatus.negotiating;

        if (pending > 0 && conversionRate < 20) {
            return `Tienes ${pending} seguimientos abiertos. Prioriza llamadas o mensajes personalizados hoy.`;
        }

        if (byStatus.accepted > 0 && conversionRate >= 40) {
            return `¡Excelente! ${conversionRate}% de cierre. Mantén el ritmo con recordatorios y propuestas claras.`;
        }

        if (quotesThisMonth === 0) {
            return 'Aún no hay actividad este mes. Crea la primera cotización o envía un mensaje proactivo.';
        }

        return 'Estado listo para operar. Usa los accesos rápidos para responder con precisión en segundos.';
    },
    
    renderStatusChart(byStatus) {
        const container = document.getElementById('status-chart');
        if (!container) return;
        
        const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;
        
        const statusColors = {
            draft: '#9ca3af',
            sent: '#3b82f6',
            negotiating: '#f59e0b',
            accepted: '#10b981',
            rejected: '#ef4444'
        };
        
        const statusNames = {
            draft: 'Borrador',
            sent: 'Enviadas',
            negotiating: 'Negociando',
            accepted: 'Aceptadas',
            rejected: 'Rechazadas'
        };
        
        container.innerHTML = Object.entries(byStatus)
            .filter(([_, count]) => count > 0)
            .map(([status, count]) => {
                const percent = ((count / total) * 100).toFixed(0);
                return `
                    <div class="chart-bar">
                        <div class="chart-bar-fill" style="width: ${percent}%; background: ${statusColors[status]}"></div>
                        <span class="chart-bar-label">${statusNames[status]}: ${count}</span>
                    </div>
                `;
            }).join('');
    },
    
    renderTypeChart(byType) {
        const container = document.getElementById('type-chart');
        if (!container) return;
        
        const total = Object.values(byType).reduce((a, b) => a + b, 0) || 1;
        
        container.innerHTML = Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => {
                const typeData = Data.productTypes[type] || Data.productTypes.otro;
                const percent = ((count / total) * 100).toFixed(0);
                return `
                    <div class="chart-bar">
                        <div class="chart-bar-fill" style="width: ${percent}%; background: ${typeData.color}"></div>
                        <span class="chart-bar-label">${typeData.icon} ${typeData.name}: ${count}</span>
                    </div>
                `;
            }).join('');
    },
    
    // ===== PDF GENERATION =====
    async generatePDF() {
        const quote = this.state.viewingQuoteId 
            ? Storage.getQuoteById(this.state.viewingQuoteId)
            : this.getQuoteFromForm();
            
        if (!quote) {
            this.showToast('No hay cotización para exportar', 'error');
            return;
        }
        
        // Validate
        if (!quote.client?.name || !quote.product) {
            this.showToast('Llena al menos cliente y producto', 'warning');
            return;
        }
        
        this.setLoading(true);
        
        try {
            await this.createPDF(quote);
            this.showToast('📄 PDF generado', 'success');
        } catch (error) {
            console.error('PDF Error:', error);
            this.showToast('Error al generar PDF', 'error');
        } finally {
            this.setLoading(false);
        }
    },
    
    async createPDF(quote) {
        // Check if jsPDF is loaded
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF no está cargado');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const config = Storage.getConfig();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let y = 20;
        
        // ===== HEADER =====
        doc.setFillColor(30, 60, 114);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        // Logo area (circle placeholder or actual logo)
        doc.setFillColor(255, 255, 255);
        doc.circle(35, 25, 15, 'F');
        
        // Try to add actual logo
        try {
            const logoImg = document.querySelector('.header-logo');
            if (logoImg && logoImg.complete) {
                doc.addImage(logoImg.src, 'PNG', 20, 10, 30, 30);
            }
        } catch (e) {
            // Use text fallback
            doc.setTextColor(30, 60, 114);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('MAGIA', 35, 23, { align: 'center' });
            doc.text('D&R', 35, 28, { align: 'center' });
        }
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN', pageWidth - margin, 22, { align: 'right' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.id || '', pageWidth - margin, 32, { align: 'right' });
        
        const today = new Date().toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        doc.setFontSize(9);
        doc.text(today, pageWidth - margin, 40, { align: 'right' });
        
        y = 60;
        
        // ===== CLIENT INFO =====
        doc.setTextColor(30, 60, 114);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE', margin, y);
        y += 7;
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(quote.client?.name || 'Sin nombre', margin, y);
        y += 5;
        
        if (quote.client?.phone) {
            doc.setFontSize(10);
            doc.text(`Tel: ${quote.client.phone}`, margin, y);
            y += 5;
        }
        if (quote.client?.email) {
            doc.text(`Email: ${quote.client.email}`, margin, y);
            y += 5;
        }
        
        y += 8;
        
        // ===== TRIP DETAILS =====
        doc.setFillColor(240, 242, 245);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'F');
        y += 10;
        
        const type = Data.productTypes[quote.type] || Data.productTypes.otro;
        
        doc.setTextColor(30, 60, 114);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLE DEL VIAJE', margin + 5, y);
        y += 8;
        
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${type.name}: ${quote.product || '-'}`, margin + 5, y);
        y += 6;
        doc.text(`Fechas: ${quote.dates || '-'}`, margin + 5, y);
        y += 6;
        doc.text(`Viajeros: ${quote.travelers || '-'}`, margin + 5, y);
        
        y += 15;
        
        // ===== INCLUDES =====
        if (quote.includes) {
            doc.setTextColor(30, 60, 114);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('✓ QUÉ INCLUYE', margin, y);
            y += 7;
            
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            quote.includes.split('\n').filter(i => i.trim()).forEach(item => {
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`• ${item.trim()}`, margin + 3, y);
                y += 5;
            });
            
            y += 5;
        }
        
        // ===== EXCLUDES =====
        if (quote.excludes) {
            doc.setTextColor(180, 60, 60);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('✗ NO INCLUYE', margin, y);
            y += 7;
            
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            
            quote.excludes.split('\n').filter(i => i.trim()).forEach(item => {
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`• ${item.trim()}`, margin + 3, y);
                y += 5;
            });
            
            y += 5;
        }
        
        // ===== PRICING BOX =====
        if (y > pageHeight - 80) {
            doc.addPage();
            y = 20;
        }
        
        const monthly = quote.months > 0 ? Math.ceil((quote.total - quote.deposit) / quote.months) : 0;
        
        y += 5;
        doc.setFillColor(30, 60, 114);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 45, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INVERSIÓN', margin + 5, y + 12);
        
        doc.setFontSize(28);
        doc.text(this.formatCurrency(quote.total), pageWidth - margin - 5, y + 15, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Apartado: ${this.formatCurrency(quote.deposit)}`, margin + 5, y + 25);
        doc.text(`${quote.months} pagos de ${this.formatCurrency(monthly)}/mes`, margin + 5, y + 33);
        
        if (quote.deadline) {
            doc.text(`Pago final: ${quote.deadline}`, pageWidth - margin - 5, y + 33, { align: 'right' });
        }
        
        y += 55;
        
        // ===== NOTES =====
        if (quote.notesClient) {
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            const noteLines = doc.splitTextToSize(`Notas: ${quote.notesClient}`, pageWidth - margin * 2);
            doc.text(noteLines, margin, y);
            y += noteLines.length * 5 + 5;
        }
        
        // ===== FOOTER =====
        y = pageHeight - 35;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        
        doc.setTextColor(30, 60, 114);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Magia Disney & Royal', margin, y);
        doc.text('Parques • Cruceros • Descuentos', pageWidth - margin, y, { align: 'right' });
        
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`WhatsApp: ${config.business?.phone || '55 8095 5139'}`, margin, y);
        
        y += 6;
        doc.setFontSize(7);
        const validity = config.quotes?.validityDays || 7;
        doc.text(`Válida por ${validity} días. ${config.quotes?.legalText || ''}`, margin, y);
        
        // ===== SAVE =====
        const clientName = (quote.client?.name || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Cotizacion_${clientName}_${quote.id}.pdf`;
        doc.save(filename);
    },
    
    // ===== EXPORT/IMPORT =====
    exportAllData() {
        const data = Storage.exportAll();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `MagiaDisneyRoyal_Backup_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('📤 Datos exportados', 'success');
    },
    
    importData(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = Storage.importAll(e.target.result);
            
            if (result.success) {
                this.loadConfig();
                this.renderFavorites();
                this.renderRecents();
                this.renderQuotesList();
                this.updateStats();
                this.showToast('📥 ' + result.message, 'success');
            } else {
                this.showToast(result.message, 'error');
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    },
    
    clearAllData() {
        this.showModal(
            'Borrar todos los datos',
            '¿Estás seguro? Se eliminarán todas las cotizaciones, clientes y configuración. Esta acción no se puede deshacer.',
            () => {
                Storage.clearAll();
                
                this.loadConfig();
                this.renderFavorites();
                this.renderRecents();
                this.renderQuotesList();
                this.loadChecklist();
                this.updateStats();
                
                this.showToast('🗑️ Todos los datos eliminados', 'success');
            }
        );
    },
    
    // ===== INFO CARDS =====
    toggleInfoCard(header) {
        header.classList.toggle('open');
        const body = header.nextElementSibling;
        if (body) body.classList.toggle('open');
    },
    
    // ===== STORAGE INFO =====
    showStorageInfo() {
        const usage = Storage.getStorageUsage();
        this.showModal(
            'Uso de almacenamiento',
            `Usando ${usage.usedMB} MB de ~5 MB (${usage.percentage}%)\n\nTienes ${Storage.getQuotes().length} cotizaciones guardadas.`,
            () => {}
        );
    }
});
