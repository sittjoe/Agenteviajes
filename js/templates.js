/**
 * Templates & Automation Module
 * Sprint 5: Pasos 041-050
 */

const Templates = {

    /**
     * Paso 041-042: Quote templates by type
     */
    templates: {
        'crucero-disney': {
            name: 'Crucero Disney',
            includes: `✓ Camarote de la categoría seleccionada
✓ Todas las comidas a bordo (restaurantes, buffet, room service)
✓ Actividades y entretenimiento a bordo
✓ Shows nocturnos de Broadway
✓ Encuentro con personajes Disney
✓ Piscinas y toboganes acuáticos
✓ Gimnasio y actividades deportivas
✓ Club infantil Oceaneer
✓ Propinas incluidas`,
            excludes: `✗ Vuelos
✗ Traslados aeropuerto-puerto
✗ Excursiones en puertos (opcional)
✗ Bebidas alcohólicas premium
✗ Spa y tratamientos
✗ Especialidades culinarias (Palo, Remy)
✗ Fotografías profesionales
✗ Compras a bordo
✗ Seguro de viaje`,
            legalText: 'Precio sujeto a disponibilidad. Impuestos portuarios incluidos. Cancelaciones según políticas de Disney Cruise Line.'
        },
        'parques-wdw': {
            name: 'Paquete Walt Disney World',
            includes: `✓ Habitación de hotel Disney en categoría seleccionada
✓ Boletos de parque con Park Hopper
✓ Disney Dining Plan (opcional)
✓ Transporte Disney Magical Express
✓ Transportation dentro de propiedad Disney
✓ MagicBands
✓ Extra Magic Hours
✓ Memory Maker (opcional)`,
            excludes: `✗ Vuelos
✗ Traslados fuera de propiedad Disney
✗ Comidas (si no se agrega Dining Plan)
✗ Experiencias premium (tours VIP, After Hours)
✗ Souvenirs y compras
✗ Propinas
✗ Seguro de viaje`,
            legalText: 'Paquete Disney World válido por 7 días. Precios sujetos a disponibilidad y temporada.'
        },
        'crucero-royal': {
            name: 'Crucero Royal Caribbean',
            includes: `✓ Camarote de la categoría seleccionada
✓ Todas las comidas en restaurantes principales
✓ Entretenimiento y shows a bordo
✓ Uso de piscinas y jacuzzis
✓ Gimnasio y pista de jogging
✓ Actividades deportivas
✓ Club infantil Adventure Ocean
✓ Servicio a la habitación 24/7`,
            excludes: `✗ Vuelos
✗ Traslados
✗ Excursiones en puertos
✗ Bebidas (alcoholicas y refrescos)
✗ Restaurantes de especialidad
✗ Spa y salón de belleza
✗ Casino
✗ Internet WiFi
✗ Propinas
✗ Seguro de viaje`,
            legalText: 'Precio por persona en ocupación doble. Impuestos incluidos. Políticas de cancelación según Royal Caribbean.'
        }
    },

    /**
     * Paso 043: Apply template to quote
     */
    applyTemplate(quoteType) {
        const template = this.templates[quoteType];
        if (!template) return null;

        return {
            includes: template.includes,
            excludes: template.excludes,
            notesClient: template.legalText
        };
    },

    /**
     * Paso 044-046: Message templates with variables
     */
    messageTemplates: {
        followUpInitial: {
            name: 'Seguimiento Inicial',
            body: `Hola {nombre}! 👋

Gracias por tu interés en {producto}.

Te comparto la cotización que preparé para ti:

{resumen_cotizacion}

💰 Inversión total: {total}
💳 Apartado: {apartado}
📅 {meses} pagos mensuales de {pago_mensual}

¿Tienes alguna pregunta? Estoy para ayudarte! 😊`,
            trigger: 'manual'
        },
        followUp3Days: {
            name: 'Seguimiento 3 Días',
            body: `Hola {nombre}! 😊

¿Ya tuviste oportunidad de revisar la cotización de {producto}?

Si tienes dudas o quieres ajustar algo, con gusto te ayudo.

También puedo ofrecerte otras fechas u opciones de pago. 💳

¿Cuándo podríamos platicar?`,
            trigger: 'auto',
            daysAfter: 3
        },
        followUp7Days: {
            name: 'Seguimiento 7 Días',
            body: `Hola {nombre}! 

Solo te escribo para recordarte que la cotización de {producto} vence en pocos días.

Las tarifas pueden cambiar y la disponibilidad es limitada. 

¿Te gustaría que apartáramos tu espacio? Con solo {apartado} podemos reservar. 🎉

Quedo pendiente!`,
            trigger: 'auto',
            daysAfter: 7
        },
        confirmation: {
            name: 'Confirmación de Reserva',
            body: `🎉 ¡Felicidades {nombre}!

Tu reserva de {producto} está CONFIRMADA ✅

Detalles:
📅 Fechas: {fechas}
👥 Viajeros: {viajeros}
📋 Referencia: {id}

Próximos pasos:
1️⃣ Revisar documentación necesaria
2️⃣ Programar pagos restantes
3️⃣ Tips de viaje personalizados

¡Prepárate para una experiencia MÁGICA! ✨`,
            trigger: 'status_change'
        }
    },

    /**
     * Paso 043: Replace variables in message
     */
    fillTemplate(templateKey, variables) {
        const template = this.messageTemplates[templateKey];
        if (!template) return '';

        let message = template.body;

        Object.keys(variables).forEach(key => {
            const placeholder = `{${key}}`;
            message = message.replaceAll(placeholder, variables[key]);
        });

        return message;
    },

    /**
     * Paso 045: Scheduled messages
     */
    getScheduledMessages() {
        return Storage.get('scheduledMessages') || [];
    },

    scheduleMessage(message) {
        const messages = this.getScheduledMessages();
        messages.push({
            id: 'MSG-' + Date.now(),
            ...message,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        Storage.set('scheduledMessages', messages);
    },

    /**
     * Paso 047: Auto follow-up reminders
     */
    checkFollowUps() {
        const quotes = Storage.getQuotes();
        const now = new Date();

        const needsFollowUp = [];

        quotes.forEach(quote => {
            if (quote.status !== 'sent' && quote.status !== 'negotiating') return;

            const createdDate = new Date(quote.createdAt);
            const daysSince = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

            const lastContact = quote.lastContact ? new Date(quote.lastContact) : createdDate;
            const daysSinceContact = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));

            if (daysSinceContact >= 3 && daysSinceContact < 4) {
                needsFollowUp.push({
                    quote,
                    urgency: 'medium',
                    suggestion: 'Enviar seguimiento 3 días'
                });
            } else if (daysSinceContact >= 7) {
                needsFollowUp.push({
                    quote,
                    urgency: 'high',
                    suggestion: 'Enviar recordatorio de vencimiento'
                });
            }
        });

        return needsFollowUp;
    },

    /**
     * Paso 049: Quick responses with shortcuts
     */
    quickResponses: {
        '/gracias': '¡Muchas gracias por tu interés! Con gusto te ayudo 😊',
        '/whatsapp': 'Te comparto este link para más info: ',
        '/disponibilidad': 'Permíteme verificar disponibilidad y te confirmo en unos minutos 👍',
        '/pagos': 'Contamos con planes de pago flexibles. ¿Cuántos meses te gustaría diferir?',
        '/documentos': 'Documentos necesarios:\n📄 Pasaporte vigente (mínimo 6 meses)\n📄 Visa (si aplica)\n📄 Certificado de vacunación',
        '/cancelacion': 'Políticas de cancelación:\n- Hasta 60 días: Reembolso total\n- 30-59 días: 50% de penalización\n- Menos de 30 días: No reembolsable'
    },

    expandShortcut(text) {
        const shortcuts = Object.keys(this.quickResponses);
        for (const shortcut of shortcuts) {
            if (text.includes(shortcut)) {
                text = text.replace(shortcut, this.quickResponses[shortcut]);
            }
        }
        return text;
    }
};

/**
 * Automation Engine
 * Paso 048: Auto-responses
 */
const Automation = {

    rules: [],

    addRule(rule) {
        this.rules.push({
            id: 'RULE-' + Date.now(),
            ...rule,
            enabled: true
        });
    },

    processIncoming(message) {
        const keywords = message.toLowerCase();
        let autoResponse = null;

        if (keywords.includes('precio') || keywords.includes('costo') || keywords.includes('cuanto')) {
            autoResponse = 'Con gusto te envío una cotización personalizada. ¿Me compartes:\n1. Destino de interés\n2. Fechas aproximadas\n3. Número de viajeros';
        } else if (keywords.includes('disponibilidad') || keywords.includes('hay lugar')) {
            autoResponse = 'Déjame verificar disponibilidad y te confirmo en breve 👍';
        } else if (keywords.includes('pago') || keywords.includes('abono') || keywords.includes('mensualidad')) {
            autoResponse = 'Manejamos planes de pago flexibles desde 3 hasta 12 meses sin intereses 💳';
        }

        return autoResponse;
    }
};
