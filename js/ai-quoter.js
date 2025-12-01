/**
 * AI Quoter - Genera una cotización leyendo fotos + texto
 * Usa el modelo configurado (por defecto gpt-4o-mini con visión)
 */

Object.assign(App, {
    aiMaxImages: 4,

    handleAIFileInput(event) {
        const files = Array.from(event.target?.files || []);
        if (files.length === 0) return;
        this.addAIUploads(files);
        // Reset input so the same file can be selected again
        event.target.value = '';
    },

    handleAIDragOver(event) {
        event.preventDefault();
        document.getElementById('ai-dropzone')?.classList.add('dragging');
    },

    handleAIDragLeave(event) {
        event.preventDefault();
        document.getElementById('ai-dropzone')?.classList.remove('dragging');
    },

    handleAIDrop(event) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        this.addAIUploads(files);
        this.handleAIDragLeave(event);
    },

    async addAIUploads(files = []) {
        if (!files.length) return;

        const validImages = files.filter(f => f.type.startsWith('image/'));
        if (validImages.length === 0) {
            this.showToast('Solo se aceptan imágenes (JPG, PNG, HEIC).', 'warning');
            return;
        }

        const remaining = this.aiMaxImages - (this.state.aiUploads?.length || 0);
        if (remaining <= 0) {
            this.showToast(`Máximo ${this.aiMaxImages} fotos por solicitud.`, 'warning');
            return;
        }

        const toProcess = validImages.slice(0, remaining);
        const uploads = this.state.aiUploads || [];

        for (const file of toProcess) {
            if (file.size > 8 * 1024 * 1024) {
                this.showToast(`'${file.name}' es muy pesada (máx 8MB).`, 'warning');
                continue;
            }
            try {
                const dataUrl = await this.fileToDataUrl(file);
                uploads.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    dataUrl
                });
            } catch (err) {
                console.error('AI upload error', err);
                this.showToast(`No pude leer ${file.name}`, 'error');
            }
        }

        this.state.aiUploads = uploads.slice(0, this.aiMaxImages);
        this.renderAIUploads();
    },

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    renderAIUploads() {
        const container = document.getElementById('ai-upload-list');
        if (!container) return;

        const uploads = this.state.aiUploads || [];
        if (uploads.length === 0) {
            container.innerHTML = '<div class="muted" style="font-size:12px;">Aún no hay fotos. Sube capturas con precios, itinerarios o requisitos.</div>';
            return;
        }

        container.innerHTML = uploads.map((u, idx) => `
            <div class="ai-upload-item">
                <img class="ai-upload-thumb" src="${u.dataUrl}" alt="Foto ${idx + 1}">
                <div class="ai-upload-meta">
                    <div class="name">${u.name}</div>
                    <div class="details">${(u.size / 1024).toFixed(0)} KB</div>
                </div>
                <button class="ai-remove-btn" type="button" onclick="App.removeAIUpload(${idx})">✕</button>
            </div>
        `).join('');
    },

    removeAIUpload(index) {
        if (!this.state.aiUploads) return;
        this.state.aiUploads.splice(index, 1);
        this.renderAIUploads();
    },

    resetAIQuoteInputs() {
        this.state.aiUploads = [];
        this.renderAIUploads();
        this.setInputValue('ai-notes', '');
        const input = document.getElementById('ai-file-input');
        if (input) input.value = '';
        this.handleAIDragLeave(new Event('dragleave'));
    },

    normalizeList(value) {
        if (Array.isArray(value)) {
            return value.filter(Boolean).map(v => v.toString().trim()).join('\n');
        }
        if (typeof value === 'string') {
            return value.trim();
        }
        return '';
    },

    parseNumber(value) {
        if (value === null || value === undefined) return null;
        const cleaned = String(value).replace(/[^\d.,-]/g, '');
        if (!cleaned) return null;
        // Remove thousands separators and standardize decimal
        const normalized = cleaned.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return Number.isFinite(num) ? num : null;
    },

    normalizeQuoteType(type = '') {
        const t = type.toLowerCase();
        if (t.includes('royal')) return 'crucero-royal';
        if (t.includes('crucero') && t.includes('disney')) return 'crucero-disney';
        if (t.includes('crucero')) return 'crucero-royal';
        if (t.includes('wdw') || t.includes('orlando') || t.includes('magic') || t.includes('epcot') || t.includes('hollywood')) return 'parques-wdw';
        if (t.includes('disneyland') || t.includes('california')) return 'parques-dl';
        if (t.includes('hotel')) return 'hotel-disney';
        if (t.includes('paquete') || t.includes('package')) return 'paquete';
        return 'otro';
    },

    applyAIQuoteSuggestion(suggestion = {}) {
        const includes = this.normalizeList(suggestion.includes || suggestion.included);
        const excludes = this.normalizeList(suggestion.excludes || suggestion.not_included);
        const itinerary = this.normalizeList(suggestion.itinerary || suggestion.plan);
        const paymentPlan = this.normalizeList(suggestion.payment_plan);
        const nextSteps = this.normalizeList(suggestion.next_steps);
        const total = this.parseNumber(suggestion.total ?? suggestion.price_total ?? suggestion.amount_total);
        const deposit = this.parseNumber(suggestion.deposit ?? suggestion.downpayment ?? suggestion.apartado);
        const months = parseInt(suggestion.months ?? suggestion.payments ?? 6, 10);
        const rawType = suggestion.type || suggestion.trip_type || '';

        if (suggestion.client_name) this.setInputValue('quote-client-name', suggestion.client_name);
        if (suggestion.client_email) this.setInputValue('quote-client-email', suggestion.client_email);
        if (suggestion.client_phone) this.setInputValue('quote-client-phone', suggestion.client_phone);

        if (rawType) {
            this.setInputValue('quote-type', this.normalizeQuoteType(rawType));
        }
        if (suggestion.product || suggestion.destination || suggestion.trip_name) {
            this.setInputValue('quote-product', suggestion.product || suggestion.destination || suggestion.trip_name);
        }

        if (suggestion.date_start) this.setInputValue('quote-date-start', suggestion.date_start);
        if (suggestion.date_end) this.setInputValue('quote-date-end', suggestion.date_end);

        const adults = this.parseNumber(suggestion.adults);
        if (adults !== null) {
            const safeAdults = Math.max(1, Math.round(adults));
            this.setInputValue('quote-adults', safeAdults);
        }

        const children = this.parseNumber(suggestion.children);
        if (children !== null) {
            const safeChildren = Math.max(0, Math.round(children));
            this.setInputValue('quote-children', safeChildren);
            this.updateChildrenAges();
            if (Array.isArray(suggestion.children_ages)) {
                suggestion.children_ages.slice(0, safeChildren).forEach((age, idx) => {
                    this.setInputValue(`child-age-${idx}`, age);
                });
            }
        }

        if (includes) this.setInputValue('quote-includes', includes);
        if (excludes) this.setInputValue('quote-excludes', excludes);
        if (itinerary) this.setInputValue('quote-itinerary', itinerary);

        if (total !== null) this.setInputValue('quote-total', total);
        if (deposit !== null) this.setInputValue('quote-deposit', deposit);
        if (Number.isFinite(months) && months > 0) this.setInputValue('quote-months', Math.min(Math.max(months, 1), 12));

        if (suggestion.payment_deadline || suggestion.deadline) {
            this.setInputValue('quote-deadline', suggestion.payment_deadline || suggestion.deadline);
        }
        if (suggestion.valid_until) {
            this.setInputValue('quote-valid-until', suggestion.valid_until);
        }
        if (paymentPlan) this.setInputValue('quote-payment-plan', paymentPlan);
        if (suggestion.payment_link) this.setInputValue('quote-payment-link', suggestion.payment_link);
        if (nextSteps) this.setInputValue('quote-next-steps', nextSteps);
        if (suggestion.notes_client || suggestion.pitch) this.setInputValue('quote-notes-client', suggestion.notes_client || suggestion.pitch);
        if (suggestion.notes_internal) this.setInputValue('quote-notes-internal', suggestion.notes_internal);

        this.markQuoteChanged();
        this.calculateMonthly();
        this.updateQuotePreview();
    },

    async generateQuoteFromAI() {
        const config = Storage.getConfig();
        const apiKey = config.ai?.apiKey?.trim();
        const model = config.ai?.model || 'gpt-4o-mini';
        const notes = this.getInputValue('ai-notes');
        const uploads = this.state.aiUploads || [];

        if (!apiKey) {
            this.showToast('Agrega tu OpenAI API Key en Ajustes → IA.', 'warning');
            return;
        }

        if (!notes && uploads.length === 0) {
            this.showToast('Comparte fotos o notas para que la IA genere la cotización.', 'warning');
            return;
        }

        const btn = document.getElementById('ai-generate-btn');
        const originalText = btn?.textContent;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Generando...';
        }

        this.setLoading(true);

        try {
            const baseQuote = this.getQuoteFromForm ? this.getQuoteFromForm() : {};
            const travelerLine = `${baseQuote.adults || 0} adultos, ${baseQuote.children || 0} niños${baseQuote.childrenAges?.length ? ` (${baseQuote.childrenAges.join(', ')} años)` : ''}`;
            const budgetLine = baseQuote.total ? `Presupuesto preliminar: ${baseQuote.total}` : 'Presupuesto no definido';

            const messages = [
                {
                    role: 'system',
                    content: `Eres un travel designer premium (Magia Disney & Royal). Lee fotos + texto y devuelve SOLO JSON compacto con campos:
{
  "client_name": "",
  "type": "crucero-disney|crucero-royal|parques-wdw|parques-dl|hotel-disney|paquete|otro",
  "product": "",
  "date_start": "YYYY-MM-DD",
  "date_end": "YYYY-MM-DD",
  "adults": 2,
  "children": 0,
  "children_ages": [ ],
  "includes": ["..."],
  "excludes": ["..."],
  "itinerary": ["Día 1: ..."],
  "total": 0,
  "deposit": 0,
  "months": 6,
  "payment_plan": ["Pago 1 ...", "..."],
  "payment_deadline": "YYYY-MM-DD",
  "payment_link": "",
  "next_steps": ["Confirma datos", "Aparta hoy"],
  "notes_client": "pitch breve y espectacular en español",
  "notes_internal": ""
}
Si falta info, infiérela con sentido premium. Mantén todo en español neutro, sin texto extra fuera del JSON.`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Notas del agente: ${notes || 'Sin notas adicionales'}` },
                        { type: 'text', text: `Contexto previo (puedes mejorarlo): destino actual: ${baseQuote.product || 'sin definir'}; fechas: ${baseQuote.dateStart || '-'} a ${baseQuote.dateEnd || '-'}; viajeros: ${travelerLine}; ${budgetLine}.` },
                        ...uploads.map(u => ({ type: 'image_url', image_url: { url: u.dataUrl } }))
                    ]
                }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.5,
                    response_format: { type: 'json_object' },
                    max_tokens: 900
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData?.error?.message || `Error ${response.status}`;
                throw new Error(message);
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content) throw new Error('La IA no devolvió contenido.');

            let suggestion;
            try {
                suggestion = JSON.parse(content);
            } catch (err) {
                throw new Error('La IA no envió JSON válido.');
            }

            this.applyAIQuoteSuggestion(suggestion);
            this.showToast('✨ Cotización generada. Revisa y guarda.', 'success', 4000);
        } catch (err) {
            console.error('AI quote error', err);
            this.showToast(`Error con IA: ${err.message}`, 'error', 5000);
        } finally {
            this.setLoading(false);
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText || '✨ Crear con IA';
            }
        }
    }
});
