/**
 * Enhanced Form Inputs Module
 * Sprint 2: Pasos 013-014, 018, 020
 */

const FormEnhancer = {

    /**
     * Paso 013: Date picker mejorado con flatpickr-like functionality
     */
    enhanceDatePicker(inputId, options = {}) {
        const input = document.getElementById(inputId);
        if (!input || input.type !== 'date') return;

        // Add clear button
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'flex';
        wrapper.style.gap = '8px';

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        if (options.allowClear) {
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '✕';
            clearBtn.className = 'btn-secondary btn-sm';
            clearBtn.style.padding = '8px 12px';
            clearBtn.title = 'Limpiar fecha';
            clearBtn.onclick = (e) => {
                e.preventDefault();
                input.value = '';
                input.dispatchEvent(new Event('change'));
            };
            wrapper.appendChild(clearBtn);
        }

        // Add quick date buttons if needed
        if (options.quickDates) {
            const quickBtns = document.createElement('div');
            quickBtns.style.cssText = 'display: flex; gap: 6px; margin-top: 6px;';

            options.quickDates.forEach(({ label, days }) => {
                const btn = document.createElement('button');
                btn.textContent = label;
                btn.className = 'btn-secondary btn-sm';
                btn.style.fontSize = '11px';
                btn.style.padding = '4px 10px';
                btn.onclick = (e) => {
                    e.preventDefault();
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    input.value = date.toISOString().split('T')[0];
                    input.dispatchEvent(new Event('change'));
                };
                quickBtns.appendChild(btn);
            });

            wrapper.parentNode.insertBefore(quickBtns, wrapper.nextSibling);
        }
    },

    /**
     * Paso 014: Búsqueda de destinos con sugerencias
     */
    destinationSearch: {
        destinations: [
            // Disney Cruises
            { name: 'Disney Wish - Bahamas', type: 'crucero-disney', tags: ['crucero', 'bahamas', 'caribe'] },
            { name: 'Disney Dream - Caribe', type: 'crucero-disney', tags: ['crucero', 'caribe'] },
            { name: 'Disney Fantasy - Caribe', type: 'crucero-disney', tags: ['crucero', 'caribe'] },
            { name: 'Disney Magic - Alaska', type: 'crucero-disney', tags: ['crucero', 'alaska'] },
            // Royal Caribbean
            { name: 'Icon of the Seas - Caribe', type: 'crucero-royal', tags: ['crucero', 'caribe', 'icon'] },
            { name: 'Wonder of the Seas - Caribe', type: 'crucero-royal', tags: ['crucero', 'caribe'] },
            { name: 'Symphony of the Seas - Mediterráneo', type: 'crucero-royal', tags: ['crucero', 'europa'] },
            // Parks
            { name: 'Walt Disney World - Orlando', type: 'parques-wdw', tags: ['parque', 'orlando', 'florida'] },
            { name: 'Disneyland - California', type: 'parques-dl', tags: ['parque', 'california'] },
            { name: 'Magic Kingdom', type: 'parques-wdw', tags: ['parque', 'orlando'] },
            { name: 'EPCOT', type: 'parques-wdw', tags: ['parque', 'orlando'] },
            { name: 'Hollywood Studios', type: 'parques-wdw', tags: ['parque', 'orlando'] },
            { name: 'Animal Kingdom', type: 'parques-wdw', tags: ['parque', 'orlando'] },
            // Hotels
            { name: 'Disney Grand Floridian', type: 'hotel-disney', tags: ['hotel', 'orlando', 'deluxe'] },
            { name: 'Disney Contemporary Resort', type: 'hotel-disney', tags: ['hotel', 'orlando', 'deluxe'] },
            { name: 'Disney Polynesian Village', type: 'hotel-disney', tags: ['hotel', 'orlando', 'deluxe'] },
            { name: 'Disney Art of Animation', type: 'hotel-disney', tags: ['hotel', 'orlando', 'value'] },
            // Packages
            { name: 'Paquete completo WDW 7 días', type: 'paquete', tags: ['paquete', 'orlando'] },
            { name: 'Paquete Crucero + Parques', type: 'paquete', tags: ['paquete', 'combo'] }
        ],

        attach(inputId) {
            const input = document.getElementById(inputId);
            if (!input) return;

            const dropdown = document.createElement('div');
            dropdown.className = 'destination-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--

);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                max-height: 300px;
                overflow-y: auto;
                z-index: 50;
                display: none;
                margin-top: 4px;
            `;
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(dropdown);

            input.addEventListener('input', () => {
                const query = input.value.toLowerCase();
                if (query.length < 2) {
                    dropdown.style.display = 'none';
                    return;
                }

                const matches = this.destinations.filter(dest =>
                    dest.name.toLowerCase().includes(query) ||
                    dest.tags.some(tag => tag.includes(query))
                );

                if (matches.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }

                dropdown.innerHTML = matches.slice(0, 10).map(dest => {
                    const typeData = Data.productTypes[dest.type] || Data.productTypes.otro;
                    return `
                        <div class="destination-item" data-name="${dest.name}" data-type="${dest.type}" 
                             style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">${typeData.icon}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 13px;">${dest.name}</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">${typeData.name}</div>
                            </div>
                        </div>
                    `;
                }).join('');
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.destination-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = item.dataset.name;
                        const typeSelect = document.getElementById('quote-type');
                        if (typeSelect) {
                            typeSelect.value = item.dataset.type;
                        }
                        dropdown.style.display = 'none';
                        input.dispatchEvent(new Event('input'));
                        if (App.markQuoteChanged) App.markQuoteChanged();
                        if (App.updateQuotePreview) App.updateQuotePreview();
                    });
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'var(--bg-alt)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'var(--card)';
                    });
                });
            });

            document.addEventListener('click', (e) => {
                if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        }
    },

    /**
     * Paso 018: Campo de porcentaje para descuentos
     */
    attachPercentageField(inputId, options = {}) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const symbol = document.createElement('span');
        symbol.textContent = '%';
        symbol.style.cssText = `
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
            font-weight: 600;
            pointer-events: none;
        `;
        wrapper.appendChild(symbol);

        input.style.paddingRight = '32px';

        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9.]/g, '');

            const num = parseFloat(value);
            if (!isNaN(num)) {
                if (num > 100) value = '100';
                if (num < 0) value = '0';
            }

            e.target.value = value;
        });

        FormValidator.attachRealTimeValidation(inputId, 'percentage');
    },

    /**
     * Paso 020: Botón limpiar formulario
     */
    addClearFormButton(formContainerId, buttonText = '🗑️ Limpiar formulario') {
        const container = document.getElementById(formContainerId);
        if (!container) return;

        const actionRow = container.querySelector('.action-row') || (() => {
            const row = document.createElement('div');
            row.className = 'action-row';
            container.appendChild(row);
            return row;
        })();

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-secondary btn-sm';
        clearBtn.innerHTML = buttonText;
        clearBtn.style.marginLeft = 'auto';

        clearBtn.onclick = (e) => {
            e.preventDefault();

            if (App.showModal) {
                App.showModal(
                    'Limpiar formulario',
                    '¿Estás seguro de que quieres limpiar todos los campos? Esta acción no se puede deshacer.',
                    () => {
                        const inputs = container.querySelectorAll('input:not([readonly]), textarea, select');
                        inputs.forEach(input => {
                            if (input.type === 'checkbox') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                input.selectedIndex = 0;
                            } else {
                                input.value = '';
                            }

                            // Clear validation states
                            input.style.borderColor = '';
                            const errorDiv = input.parentNode.querySelector('.form-error');
                            if (errorDiv) errorDiv.style.display = 'none';
                        });

                        if (App.updateQuotePreview) App.updateQuotePreview();
                        if (App.showToast) App.showToast('✅ Formulario limpiado', 'success');
                    }
                );
            }
        };

        actionRow.appendChild(clearBtn);
    }
};

// Initialize enhancements
if (typeof App !== 'undefined') {
    const originalInit = App.init || function () { };
    App.init = function () {
        originalInit.call(this);

        // Paso 013: Enhanced date pickers
        FormEnhancer.enhanceDatePicker('quote-date-start', {
            allowClear: true,
            quickDates: [
                { label: 'Hoy', days: 0 },
                { label: '+1 mes', days: 30 },
                { label: '+3 meses', days: 90 }
            ]
        });
        FormEnhancer.enhanceDatePicker('quote-date-end', { allowClear: true });
        FormEnhancer.enhanceDatePicker('quote-deadline', { allowClear: true });
        FormEnhancer.enhanceDatePicker('quote-valid-until', { allowClear: true });

        // Paso 014: Destination search
        FormEnhancer.destinationSearch.attach('quote-product');

        // Paso 020: Clear form button (will be added when in quote-form screen)
        setTimeout(() => {
            if (document.getElementById('quote-form')) {
                FormEnhancer.addClearFormButton('quote-form');
            }
        }, 500);
    };
}
