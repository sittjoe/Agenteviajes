/**
 * Form Validation & Enhancement Module
 * Sprint 2: Pasos 011-020
 */

const FormValidator = {

    // Validation rules
    rules: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneMX: /^(\+?52)?[\s-]?(\d{2,3})[\s-]?(\d{4})[\s-]?(\d{4})$/,
        required: (value) => value && value.trim().length > 0,
        minLength: (value, min) => value && value.length >= min,
        maxLength: (value, max) => value && value.length <= max,
        numeric: /^[0-9]+$/,
        alphanumeric: /^[a-zA-Z0-9\s]+$/,
        currency: /^\d+(\.\d{1,2})?$/,
        percentage: /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/
    },

    // Error messages
    messages: {
        required: 'Este campo es requerido',
        email: 'Email inválido',
        phone: 'Teléfono inválido (ej: 55 1234 5678)',
        minLength: 'Mínimo {min} caracteres',
        maxLength: 'Máximo {max} caracteres',
        currency: 'Monto inválido',
        percentage: 'Porcentaje inválido (0-100)'
    },

    /**
     * Paso 011: Validación en tiempo real
     */
    attachRealTimeValidation(inputId, validationType, options = {}) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.color = 'var(--danger)';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        errorDiv.style.display = 'none';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);

        const validate = () => {
            const value = input.value;
            let isValid = true;
            let errorMsg = '';

            // Required check
            if (options.required && !this.rules.required(value)) {
                isValid = false;
                errorMsg = this.messages.required;
            }

            // Type-specific validation
            if (isValid && value) {
                switch (validationType) {
                    case 'email':
                        if (!this.rules.email.test(value)) {
                            isValid = false;
                            errorMsg = this.messages.email;
                        }
                        break;
                    case 'phone':
                        if (!this.rules.phoneMX.test(value)) {
                            isValid = false;
                            errorMsg = this.messages.phone;
                        }
                        break;
                    case 'currency':
                        if (!this.rules.currency.test(value)) {
                            isValid = false;
                            errorMsg = this.messages.currency;
                        }
                        break;
                    case 'percentage':
                        if (!this.rules.percentage.test(value)) {
                            isValid = false;
                            errorMsg = this.messages.percentage;
                        }
                        break;
                }
            }

            // Length validation
            if (isValid && options.minLength && value.length < options.minLength) {
                isValid = false;
                errorMsg = this.messages.minLength.replace('{min}', options.minLength);
            }

            if (isValid && options.maxLength && value.length > options.maxLength) {
                isValid = false;
                errorMsg = this.messages.maxLength.replace('{max}', options.maxLength);
            }

            // Update UI
            if (!isValid && value) {
                input.style.borderColor = 'var(--danger)';
                errorDiv.textContent = errorMsg;
                errorDiv.style.display = 'block';
            } else {
                input.style.borderColor = isValid && value ? 'var(--success)' : '';
                errorDiv.style.display = 'none';
            }

            return isValid;
        };

        input.addEventListener('input', validate);
        input.addEventListener('blur', validate);

        // Store validator on element
        input._validator = validate;
    },

    /**
     * Paso 012: Autocomplete para clientes
     */
    attachClientAutocomplete(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow-md);
            max-height: 200px;
            overflow-y: auto;
            z-index: 50;
            display: none;
        `;
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(dropdown);

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            const quotes = Storage.getQuotes();
            const clients = [...new Set(quotes.map(q => q.client?.name).filter(n => n))];
            const matches = clients.filter(name => name.toLowerCase().includes(query));

            if (matches.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            dropdown.innerHTML = matches.map(name => `
                <div class="autocomplete-item" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border-light);">
                    ${name}
                </div>
            `).join('');
            dropdown.style.display = 'block';

            dropdown.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
                item.addEventListener('click', () => {
                    input.value = matches[idx];
                    dropdown.style.display = 'none';
                    input.dispatchEvent(new Event('input'));
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
    },

    /**
     * Paso 017: Formato de moneda automático
     */
    attachCurrencyFormat(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9.]/g, '');

            // Only one decimal point
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }

            // Max 2 decimal places
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + '.' + parts[1].substring(0, 2);
            }

            e.target.value = value;
        });

        input.addEventListener('blur', (e) => {
            let value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2);
            }
        });
    },

    /**
     * Paso 019: Contador de caracteres
     */
    attachCharCounter(textareaId, maxLength = null) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 4px;
        `;
        textarea.parentNode.appendChild(counter);

        if (maxLength) {
            textarea.setAttribute('maxlength', maxLength);
        }

        const updateCounter = () => {
            const current = textarea.value.length;
            const max = maxLength || '∞';
            counter.textContent = `${current}${maxLength ? '/' + max : ''} caracteres`;

            if (maxLength && current > maxLength * 0.9) {
                counter.style.color = 'var(--warning)';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        };

        textarea.addEventListener('input', updateCounter);
        updateCounter();
    },

    /**
     * Validate entire form
     */
    validateForm(formId) {
        const form = document.getElementById(formId) || document.querySelector('form');
        if (!form) return true;

        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (input._validator) {
                if (!input._validator()) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }
};

// Auto-initialize validations for quote form
Object.assign(App, {
    initFormValidations() {
        // Paso 015: Email validation
        FormValidator.attachRealTimeValidation('quote-client-email', 'email');
        FormValidator.attachRealTimeValidation('config-email', 'email');

        // Paso 016: Phone validation
        FormValidator.attachRealTimeValidation('quote-client-phone', 'phone');
        FormValidator.attachRealTimeValidation('config-phone', 'phone');

        // Paso 011: Required fields
        FormValidator.attachRealTimeValidation('quote-client-name', null, { required: true, minLength: 2 });
        FormValidator.attachRealTimeValidation('quote-product', null, { required: true, minLength: 3 });

        // Paso 012: Autocomplete
        FormValidator.attachClientAutocomplete('quote-client-name');

        // Paso 017: Currency formatting
        FormValidator.attachCurrencyFormat('quote-total');
        FormValidator.attachCurrencyFormat('quote-deposit');
        FormValidator.attachCurrencyFormat('calc-total');
        FormValidator.attachCurrencyFormat('calc-deposit');

        // Paso 019: Character counters
        FormValidator.attachCharCounter('quote-includes', 500);
        FormValidator.attachCharCounter('quote-excludes', 500);
        FormValidator.attachCharCounter('quote-notes-internal', 1000);
        FormValidator.attachCharCounter('quote-notes-client', 500);
        FormValidator.attachCharCounter('config-legal', 300);
    }
});

// Initialize on app load
if (typeof App !== 'undefined') {
    const originalInit = App.init || function () { };
    App.init = function () {
        originalInit.call(this);
        this.initFormValidations();
    };
}
