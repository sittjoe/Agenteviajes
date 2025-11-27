/**
 * Data - Respuestas, información y configuraciones
 * Versión 2.0 - Expandido
 */

const Data = {
    
    // ===== RESPUESTAS POR SITUACIÓN =====
    responses: {
        // ===== ETAPA: NUEVO =====
        saludo: {
            id: 'saludo',
            title: 'Saludo inicial',
            stage: 'nuevo',
            icon: '👋',
            message: `¡Hola! 👋 Gracias por escribir a Magia Disney & Royal.

¿En qué te puedo ayudar?

🏰 Parques Disney
🚢 Cruceros Disney y Royal Caribbean  
🏨 Hoteles
✈️ Viajes a cualquier destino

Cuéntame qué tienes en mente 😊`,
            tip: 'No bombardees con info. Espera a que te diga qué le interesa. Sé cálido pero breve.',
            next: 'Preguntará por algún producto o destino específico',
            nextActions: [
                { label: 'Quiere crucero', goto: 'pedir_datos' },
                { label: 'Quiere parques', goto: 'pedir_datos' },
                { label: 'Pregunta precios', goto: 'precios_aprox' }
            ],
            tags: ['inicio', 'primer contacto', 'hola']
        },
        
        pedir_datos: {
            id: 'pedir_datos',
            title: 'Pedir datos para cotizar',
            stage: 'nuevo',
            icon: '📋',
            message: `¡Con gusto te cotizo! 😊

Para darte la mejor opción:

1. ¿Cuántos viajan? (adultos y niños)
2. ¿Edades de los niños?
3. ¿Fechas aproximadas?
4. ¿Alguna preferencia especial?

Con eso te preparo opciones perfectas ✨`,
            tip: 'Si no te dan todos los datos, no insistas. Cotiza con lo que tengas y pregunta después.',
            next: 'Te dará los datos o preguntará algo más',
            nextActions: [
                { label: 'Me dio datos', goto: 'enviar_cotizacion' },
                { label: 'Pregunta precios primero', goto: 'precios_aprox' }
            ],
            tags: ['cotizar', 'datos', 'información']
        },
        
        precios_aprox: {
            id: 'precios_aprox',
            title: 'Solo pregunta precios',
            stage: 'nuevo',
            icon: '💰',
            message: `Los precios varían mucho según fechas y lo que incluya.

Para darte un rango real, cuéntame:
→ ¿Cuántos viajan?
→ ¿Qué fechas aproximadas?

Así te doy números reales, no inventados 😊`,
            tip: 'Nunca des precios al aire. Siempre pide al menos número de viajeros y fechas aproximadas.',
            next: 'Te dará más info',
            nextActions: [
                { label: 'Me dio datos', goto: 'pedir_datos' }
            ],
            tags: ['precios', 'costos', 'cuánto cuesta']
        },
        
        primer_crucero: {
            id: 'primer_crucero',
            title: 'Es su primer crucero',
            stage: 'nuevo',
            icon: '🚢',
            message: `¡Qué emoción que sea su primer crucero! 🎉

Te cuento lo básico:

✅ TODO incluido: comidas, shows, entretenimiento
✅ Solo desempacas UNA vez y conoces varios lugares
✅ No te puedes perder (el barco te espera 😄)
✅ Ideal para todas las edades

¿Qué te gustaría saber primero?`,
            tip: 'Los primerizos tienen muchas dudas. Sé paciente y resuelve una a la vez.',
            next: 'Preguntará sobre precios, qué incluye, o qué crucero elegir',
            nextActions: [
                { label: 'Pregunta precios', goto: 'precios_aprox' },
                { label: 'Disney vs Royal', goto: 'comparar_cruceros' }
            ],
            tags: ['primer crucero', 'principiante', 'novato']
        },
        
        comparar_cruceros: {
            id: 'comparar_cruceros',
            title: 'Disney vs Royal Caribbean',
            stage: 'nuevo',
            icon: '⚖️',
            message: `¡Ambos son increíbles! La diferencia:

🚢 DISNEY CRUISE:
• Ideal para niños chicos y fans Disney
• Personajes a bordo
• Refrescos INCLUIDOS
• Más caro pero más mágico

⚓ ROYAL CARIBBEAN:
• Barcos ENORMES con más actividades
• Toboganes, FlowRider, pared de escalar
• Mejor precio
• Ideal para adolescentes y adultos

¿Qué edades tienen los viajeros?`,
            tip: 'No digas que uno es mejor que otro. Ayúdalos a elegir según SU familia.',
            next: 'Te dirán edades y podrás recomendar',
            nextActions: [
                { label: 'Niños chicos → Disney', goto: 'pedir_datos' },
                { label: 'Adolescentes → Royal', goto: 'pedir_datos' }
            ],
            tags: ['comparar', 'disney vs royal', 'diferencias']
        },
        
        // ===== ETAPA: PREGUNTANDO =====
        porque_contigo: {
            id: 'porque_contigo',
            title: '¿Por qué contigo y no directo?',
            stage: 'preguntando',
            icon: '🤷',
            message: `¡Excelente pregunta!

El precio es exactamente el mismo 💯

La diferencia es que conmigo recibes:

✅ Monitoreo de bajadas de precio
✅ Reservaciones de restaurantes/actividades
✅ Itinerario personalizado
✅ Alguien a quién llamar si algo sale mal
✅ Tips de experto

Todo GRATIS. Mismo precio, cero estrés 😊`,
            tip: 'No te pongas a la defensiva. Es una pregunta válida. Responde con confianza.',
            next: 'Quedará convencido o preguntará más',
            nextActions: [
                { label: 'Convencido', goto: 'pedir_datos' },
                { label: 'Más dudas', goto: 'es_seguro' }
            ],
            tags: ['por qué agente', 'directo', 'valor']
        },
        
        es_seguro: {
            id: 'es_seguro',
            title: '¿Es seguro? ¿No es fraude?',
            stage: 'preguntando',
            icon: '🔒',
            message: `Entiendo la duda, es importante estar seguro 🔒

Te comento:

✅ Soy agente certificado Disney y Royal Caribbean
✅ Los pagos van DIRECTO a Disney/Royal/aerolínea, no a mí
✅ Recibes confirmación oficial de ellos
✅ Te puedo mostrar mis certificaciones

¿Te mando mis credenciales?`,
            tip: 'Ofrece pruebas. No te ofendas. Es normal que pregunten.',
            next: 'Quedará tranquilo o pedirá ver certificados',
            nextActions: [
                { label: 'Quedó tranquilo', goto: 'pedir_datos' }
            ],
            tags: ['seguro', 'fraude', 'confianza', 'certificado']
        },
        
        enviar_cotizacion: {
            id: 'enviar_cotizacion',
            title: 'Enviar cotización',
            stage: 'preguntando',
            icon: '📨',
            message: `¡Listo! Aquí está tu cotización ✨

📅 Fechas: {fechas}
👥 Viajeros: {viajeros}
📍 Destino: {destino}

📦 INCLUYE:
• {incluye}

💰 INVERSIÓN TOTAL: ${precio} USD

💳 Para apartar: ${apartado} USD
📅 Resto a pagar antes de: {fecha_limite}

¿Qué te parece? ¿Alguna duda?`,
            tip: "Usa 'inversión' no 'costo'. Destaca lo que INCLUYE. Usa el Generador de Cotización para una más completa.",
            next: 'Dirá que le gusta, que está caro, o tendrá dudas',
            nextActions: [
                { label: 'Le gustó', goto: 'cerrar' },
                { label: 'Está caro', goto: 'precio_caro' },
                { label: 'Lo va a pensar', goto: 'lo_piensa' }
            ],
            tags: ['cotización', 'enviar', 'propuesta']
        },
        
        que_incluye: {
            id: 'que_incluye',
            title: '¿Qué incluye exactamente?',
            stage: 'preguntando',
            icon: '📦',
            message: `¡Claro! Te detallo qué incluye:

✅ INCLUIDO:
• {lista_incluye}

❌ NO INCLUIDO:
• {lista_no_incluye}

💡 Tip: {tip_producto}

¿Alguna duda específica?`,
            tip: 'Sé específico. Los clientes quieren saber exactamente por qué pagan.',
            next: 'Preguntará más detalles o pedirá cotización',
            nextActions: [
                { label: 'Quiere cotizar', goto: 'pedir_datos' },
                { label: 'Más preguntas', goto: 'saludo' }
            ],
            tags: ['incluye', 'qué tiene', 'detalles']
        },
        
        // ===== ETAPA: COTIZADO =====
        precio_caro: {
            id: 'precio_caro',
            title: 'Está muy caro',
            stage: 'cotizado',
            icon: '💸',
            message: `Entiendo, es una inversión importante 💰

Te platico opciones:

1️⃣ Apartas con poco y pagas mes a mes
2️⃣ Si baja el precio, te ajusto la diferencia  
3️⃣ Te busco fechas más económicas

¿Qué te funcionaría mejor?`,
            tip: 'NUNCA justifiques el precio. Enfócate en SOLUCIONES. El problema no es el precio, es cómo pagarlo.',
            next: 'Preguntará por plan de pagos o fechas baratas',
            nextActions: [
                { label: 'Quiere plan de pagos', goto: 'plan_pagos' },
                { label: 'Quiere fechas baratas', goto: 'fechas_baratas' },
                { label: 'Sigue dudando', goto: 'lo_piensa' }
            ],
            tags: ['caro', 'precio', 'objeción', 'muy caro']
        },
        
        plan_pagos: {
            id: 'plan_pagos',
            title: 'Plan de pagos',
            stage: 'cotizado',
            icon: '💳',
            message: `¡No necesitas tener todo el dinero hoy! 🎉

Así funciona:

💳 Apartas con un porcentaje pequeño
📅 Pagas el resto poco a poco hasta tu viaje
✅ Tu lugar queda asegurado desde hoy

Ejemplo: Un viaje de $3,000 USD
→ Apartas: $200-300 USD
→ 8 meses para pagar = ~$340/mes

Es como un plan de ahorro pero con tu lugar ya reservado.

¿Quieres que te arme un plan a tu medida?`,
            tip: "Usa la calculadora en 'Tools' para dar números exactos rápido.",
            next: 'Pedirá cotización con plan o fechas',
            nextActions: [
                { label: 'Quiere cotización', goto: 'pedir_datos' },
                { label: 'Sigue dudando', goto: 'lo_piensa' }
            ],
            tags: ['pagos', 'mensualidades', 'financiamiento']
        },
        
        fechas_baratas: {
            id: 'fechas_baratas',
            title: 'Quiere fechas más económicas',
            stage: 'cotizado',
            icon: '📅',
            message: `¡Claro! Te busco opciones más accesibles 🔍

Para encontrar las mejores fechas:

1. ¿Tienen flexibilidad de fechas?
2. ¿Hay fechas que NO puedan viajar?

Generalmente las mejores tarifas están en:
📅 Septiembre (el mejor mes)
📅 Enero (después del 7)
📅 Febrero  
📅 Mayo

¡Te busco opciones!`,
            tip: 'Temporada baja = mejores precios. Evita: Semana Santa, verano, Navidad, Spring Break.',
            next: 'Te dará sus fechas flexibles',
            nextActions: [
                { label: 'Me dio fechas', goto: 'enviar_cotizacion' }
            ],
            tags: ['fechas baratas', 'económico', 'temporada baja']
        },
        
        lo_piensa: {
            id: 'lo_piensa',
            title: 'Lo voy a pensar',
            stage: 'cotizado',
            icon: '⏳',
            message: `¡Claro! Tómense su tiempo 😊

Solo te comento que precios y disponibilidad pueden cambiar. Los buenos espacios se van primero.

Si quieres, puedo guardarte el precio unos días sin compromiso.

¿Te late?`,
            tip: "Crea urgencia REAL pero sin presionar. Ofrece 'guardar precio' como beneficio.",
            next: 'Dirá que sí o que necesita más tiempo',
            nextActions: [
                { label: 'Sí, guarda precio', goto: 'cerrar' },
                { label: 'Necesita más tiempo', goto: 'mas_tiempo' }
            ],
            tags: ['pensar', 'indeciso', 'tiempo']
        },
        
        mas_tiempo: {
            id: 'mas_tiempo',
            title: 'Necesita más tiempo',
            stage: 'cotizado',
            icon: '🕐',
            message: `¡Perfecto! Sin presión 🙌

Aquí estoy cuando estén listos. Si sale alguna promoción que les convenga, te aviso.

¡Que tengan excelente día! ✨`,
            tip: 'Déjalos ir con buena vibra. Muchos regresan. No quemes el puente.',
            next: 'Puede regresar después o no',
            nextActions: [
                { label: 'Regresó después', goto: 'saludo' }
            ],
            tags: ['más tiempo', 'después', 'no presionar']
        },
        
        no_contesta: {
            id: 'no_contesta',
            title: 'No me contesta (1er seguimiento)',
            stage: 'cotizado',
            icon: '🔔',
            message: `¡Hola! 👋

¿Cómo vas? Solo quería saber si recibiste la info.

¿Tienes alguna duda? 😊`,
            tip: 'Máximo 2 seguimientos. Si no contesta después del segundo, espera 2 semanas o hasta que haya promo real.',
            next: 'Puede contestar, ignorar, o decir que ya no le interesa',
            nextActions: [
                { label: 'Contestó', goto: 'saludo' },
                { label: 'Sigue sin contestar', goto: 'no_contesta_2' }
            ],
            tags: ['seguimiento', 'no contesta', 'follow up']
        },
        
        no_contesta_2: {
            id: 'no_contesta_2',
            title: 'Segundo seguimiento',
            stage: 'cotizado',
            icon: '📢',
            message: `¡Hola! Espero que estés bien ✨

Solo te aviso que los precios pueden cambiar pronto.

Si todavía te interesa, actualizo tu cotización. Si ya no, no hay problema.

¡Saludos!`,
            tip: 'Este es el ÚLTIMO seguimiento. No seas insistente.',
            next: 'Probablemente no conteste',
            nextActions: [
                { label: 'Contestó', goto: 'saludo' },
                { label: 'Nada, lo dejo ir', goto: 'saludo' }
            ],
            tags: ['último seguimiento', 'final', 'no molestar']
        },
        
        tiene_otra_cotizacion: {
            id: 'tiene_otra_cotizacion',
            title: 'Tiene cotización de otra agencia',
            stage: 'cotizado',
            icon: '📊',
            message: `¡Perfecto! Me encanta que compares 👍

¿Me compartes qué te cotizaron? Así te puedo decir:
• Si es el mismo producto o hay diferencias
• Si el precio es realmente comparable
• Qué incluye y qué no

A veces las cotizaciones baratas NO incluyen lo mismo.

¿Me pasas los detalles?`,
            tip: 'No critiques a la competencia. Solo muestra tu valor y las diferencias objetivas.',
            next: 'Te compartirá la otra cotización',
            nextActions: [
                { label: 'Me la compartió', goto: 'enviar_cotizacion' }
            ],
            tags: ['competencia', 'otra agencia', 'comparar precios']
        },
        
        // ===== ETAPA: CERRAR =====
        cerrar: {
            id: 'cerrar',
            title: '¡Quiere reservar!',
            stage: 'cerrar',
            icon: '✅',
            message: `¡Excelente! 🎉

Para apartar tu lugar necesito:

1️⃣ Nombres completos (como en pasaporte/INE)
2️⃣ Fechas de nacimiento de todos
3️⃣ Correo electrónico

Con eso te genero el link de pago.

¡Ya casi! ✨`,
            tip: "Usa el checklist en 'Tools' para no olvidar ningún dato.",
            next: 'Te dará los datos',
            nextActions: [
                { label: 'Me dio datos', goto: 'confirmar_reserva' }
            ],
            tags: ['cerrar', 'reservar', 'sí quiero']
        },
        
        confirmar_reserva: {
            id: 'confirmar_reserva',
            title: 'Confirmar reservación',
            stage: 'cerrar',
            icon: '🎉',
            message: `🎉 ¡RESERVA CONFIRMADA! 🎉

📅 Fecha: {fecha}
📍 Destino: {destino}
👥 Viajeros: {nombres}

💰 Apartado pagado: ${monto} USD
📅 Próximo pago: {fecha_pago} por ${monto_pago} USD

Pronto te envío:
✅ Itinerario personalizado
✅ Guía del destino
✅ Tips importantes

¡Empieza la cuenta regresiva! 🚀✨`,
            tip: 'Celebra con ellos. Cumple lo prometido: manda itinerario y guías.',
            next: 'Mantendrás contacto hasta el viaje',
            nextActions: [],
            tags: ['confirmado', 'reserva lista', 'pagó']
        },
        
        // ===== ETAPA: POSTVENTA =====
        recordatorio_pago: {
            id: 'recordatorio_pago',
            title: 'Recordatorio de pago',
            stage: 'postventa',
            icon: '⏰',
            message: `¡Hola! 👋

Recordatorio amigable: tu pago de ${monto} USD vence el {fecha}.

¿Todo bien para esa fecha? Si necesitas ajustar, me dices 😊`,
            tip: 'Manda recordatorio 5-7 días antes del vencimiento.',
            next: 'Confirmará o pedirá ajuste',
            nextActions: [],
            tags: ['pago', 'recordatorio', 'vencimiento']
        },
        
        antes_viaje: {
            id: 'antes_viaje',
            title: 'Días antes del viaje',
            stage: 'postventa',
            icon: '🧳',
            message: `¡Ya casi! 🎉 Faltan pocos días para tu viaje.

Checklist rápido:
✅ Pasaportes vigentes (6+ meses)
✅ Check-in en línea hecho
✅ App de {linea} descargada
✅ Reservaciones de restaurantes listas

¿Todo en orden? ¿Alguna duda de último momento?`,
            tip: 'Un mensaje pre-viaje demuestra que te importa y previene problemas.',
            next: 'Confirmarán o preguntarán algo',
            nextActions: [],
            tags: ['antes viaje', 'preparación', 'checklist viaje']
        },
        
        despues_viaje: {
            id: 'despues_viaje',
            title: 'Después del viaje',
            stage: 'postventa',
            icon: '🏠',
            message: `¡Bienvenidos de regreso! 🏠✨

¿Cómo les fue? ¡Cuéntenme!

Si tienen fotos que quieran compartir, me encantaría verlas 📸

¡Gracias por confiar en mí! 🙏`,
            tip: 'Espera 2-3 días después de que regresan. Pide fotos para tu página.',
            next: 'Te contarán del viaje',
            nextActions: [
                { label: 'Les fue bien', goto: 'pedir_referidos' },
                { label: 'Hubo problemas', goto: 'problema_viaje' }
            ],
            tags: ['regresaron', 'feedback', 'fotos']
        },
        
        pedir_referidos: {
            id: 'pedir_referidos',
            title: 'Pedir referidos',
            stage: 'postventa',
            icon: '👥',
            message: `¡Me da mucho gusto que la hayan pasado increíble! 🎉

Si conocen a alguien planeando un viaje, con gusto lo ayudo igual que a ustedes.

¡Gracias por la confianza! ✨`,
            tip: 'No seas insistente. Menciónalo UNA vez. Los buenos clientes refieren solos.',
            next: 'Puede que refieran o no',
            nextActions: [],
            tags: ['referidos', 'recomendar', 'conocidos']
        },
        
        quiere_cancelar: {
            id: 'quiere_cancelar',
            title: 'Quiere cancelar',
            stage: 'postventa',
            icon: '❌',
            message: `Entiendo 😔

Antes de proceder, ¿me cuentas qué pasó?

→ ¿Cambio de fechas?
→ ¿Situación económica?
→ ¿Algún problema?

A veces hay opciones que no sabías 🙏`,
            tip: 'Intenta salvar la venta. Muchas cancelaciones pueden ser cambios de fecha.',
            next: 'Te explicará el motivo',
            nextActions: [
                { label: 'Quiere cambiar fecha', goto: 'cambio_fecha' },
                { label: 'Confirma cancelar', goto: 'confirmar_cancelacion' }
            ],
            tags: ['cancelar', 'reembolso', 'ya no quiere']
        },
        
        cambio_fecha: {
            id: 'cambio_fecha',
            title: 'Cambio de fecha',
            stage: 'postventa',
            icon: '🔄',
            message: `¡Claro! Cambiar fecha es posible 📅

Dependiendo de cuánto falte, puede que:
→ Sea gratis
→ Tenga cargo pequeño
→ Solo pagues diferencia de precio

¿Qué fecha nueva tenías en mente?`,
            tip: 'Revisa políticas de cambio del proveedor específico antes de prometer.',
            next: 'Te dará nueva fecha',
            nextActions: [],
            tags: ['cambio fecha', 'reprogramar', 'mover viaje']
        },
        
        confirmar_cancelacion: {
            id: 'confirmar_cancelacion',
            title: 'Confirmar cancelación',
            stage: 'postventa',
            icon: '📝',
            message: `Entendido, procedo con la cancelación 📝

Las políticas de reembolso son:
{politicas}

¿Confirmo?`,
            tip: 'Sé profesional. Deja la puerta abierta para el futuro.',
            next: 'Confirmará',
            nextActions: [],
            tags: ['confirmar cancelación', 'procesar']
        },
        
        problema_viaje: {
            id: 'problema_viaje',
            title: 'Tuvo un problema',
            stage: 'postventa',
            icon: '😟',
            message: `¡Oh no! Cuéntame qué pasó 😟

Voy a hacer todo lo posible por ayudarte.

¿Qué necesitas?`,
            tip: 'Escucha primero. No te pongas a la defensiva. Busca solución.',
            next: 'Te explicará',
            nextActions: [],
            tags: ['problema', 'queja', 'mal servicio']
        },
        
        promocion: {
            id: 'promocion',
            title: 'Hay una promoción',
            stage: 'cotizado',
            icon: '🎁',
            message: `¡Tengo excelentes noticias! 🎉

Salió una promoción que te puede interesar:

🎁 {nombre_promo}
💰 {descuento}
📅 Válida hasta: {fecha_limite}

¿Te actualizo tu cotización con esta promo?`,
            tip: 'Usa promos reales para reactivar clientes fríos. Es el mejor gancho.',
            next: 'Preguntará detalles o querrá aprovechar',
            nextActions: [
                { label: 'Quiere aprovechar', goto: 'pedir_datos' }
            ],
            tags: ['promoción', 'descuento', 'oferta']
        }
    },
    
    // ===== SITUACIONES POR ETAPA =====
    stages: {
        nuevo: {
            name: '🆕 Cliente nuevo',
            icon: '🆕',
            situations: ['saludo', 'pedir_datos', 'precios_aprox', 'primer_crucero', 'comparar_cruceros']
        },
        preguntando: {
            name: '💬 Preguntando',
            icon: '💬',
            situations: ['pedir_datos', 'enviar_cotizacion', 'porque_contigo', 'es_seguro', 'que_incluye']
        },
        cotizado: {
            name: '📋 Ya cotizado',
            icon: '📋',
            situations: ['precio_caro', 'plan_pagos', 'lo_piensa', 'fechas_baratas', 'no_contesta', 'no_contesta_2', 'tiene_otra_cotizacion', 'promocion']
        },
        cerrar: {
            name: '✅ Cerrar venta',
            icon: '✅',
            situations: ['cerrar', 'confirmar_reserva']
        },
        postventa: {
            name: '🎉 Post-venta',
            icon: '🎉',
            situations: ['recordatorio_pago', 'antes_viaje', 'despues_viaje', 'pedir_referidos', 'quiere_cancelar', 'cambio_fecha', 'confirmar_cancelacion', 'problema_viaje']
        }
    },
    
    // ===== TIPOS DE PRODUCTO =====
    productTypes: {
        'crucero-disney': { name: 'Crucero Disney', icon: '🚢', color: '#1e3c72' },
        'crucero-royal': { name: 'Crucero Royal Caribbean', icon: '⚓', color: '#00205b' },
        'parques-wdw': { name: 'Walt Disney World', icon: '🏰', color: '#1e3c72' },
        'parques-dl': { name: 'Disneyland California', icon: '🎢', color: '#1e3c72' },
        'hotel-disney': { name: 'Hotel Disney', icon: '🏨', color: '#1e3c72' },
        'hotel': { name: 'Hotel', icon: '🏨', color: '#6b7280' },
        'paquete': { name: 'Paquete completo', icon: '📦', color: '#059669' },
        'universal': { name: 'Universal Studios', icon: '🎬', color: '#000000' },
        'otro': { name: 'Otro destino', icon: '✈️', color: '#6b7280' }
    },
    
    // ===== ESTADOS DE COTIZACIÓN =====
    quoteStatuses: {
        draft: { name: 'Borrador', icon: '📝', color: '#9ca3af' },
        sent: { name: 'Enviada', icon: '📤', color: '#3b82f6' },
        viewed: { name: 'Vista', icon: '👁️', color: '#8b5cf6' },
        negotiating: { name: 'En negociación', icon: '💬', color: '#f59e0b' },
        accepted: { name: 'Aceptada', icon: '✅', color: '#10b981' },
        rejected: { name: 'Rechazada', icon: '❌', color: '#ef4444' },
        expired: { name: 'Expirada', icon: '⏰', color: '#6b7280' }
    },
    
    // ===== INFORMACIÓN DE PRODUCTOS (para tab Info) =====
    productInfo: {
        disneyCruise: {
            title: 'Disney Cruise Line',
            icon: '🚢',
            sections: [
                {
                    title: '🚢 Barcos',
                    content: '<b>Disney Wish</b> (2022, el más nuevo), <b>Disney Treasure</b> (2024), <b>Disney Fantasy</b>, <b>Disney Dream</b>, <b>Disney Magic</b>. Todos con áreas adultos, clubs niños, shows Broadway.'
                },
                {
                    title: '🌴 Destinos',
                    content: '<b>Bahamas</b> (3-4 noches, Castaway Cay), <b>Caribe</b> (7 noches), <b>Alaska</b> (verano), <b>Europa</b> (Mediterráneo), <b>México</b> (Riviera).'
                },
                {
                    title: '💰 Precios aproximados',
                    content: 'Desde <b>$1,500 USD/persona</b> (interior 3 noches) hasta <b>$5,000+ USD</b> (suite 7 noches). Niños pagan casi igual. Temporada alta +30-50%.'
                },
                {
                    title: '✅ Qué INCLUYE',
                    content: 'Comidas ilimitadas, refrescos, helado, room service 24hrs, shows Broadway, clubs niños, piscinas, cine, Castaway Cay.'
                },
                {
                    title: '❌ Qué NO incluye',
                    content: 'Alcohol, cafés especiales, excursiones, restaurantes especiales (Palo, Remy), fotos, wifi, spa, propinas ($14.50/persona/noche).'
                },
                {
                    title: '💳 Política de pagos',
                    content: '<b>Apartado:</b> $200 USD/camarote. <b>Pago final:</b> 120 días antes. Cancelación +120 días = reembolso menos $200.'
                },
                {
                    title: '💡 Tips de venta',
                    content: '• Ideal para familias con niños chicos y fans Disney<br>• Vende la EXPERIENCIA, no el precio<br>• Menciona: personajes, Castaway Cay, atención al detalle'
                }
            ]
        },
        royalCaribbean: {
            title: 'Royal Caribbean',
            icon: '⚓',
            sections: [
                {
                    title: '🚢 Clases de barcos',
                    content: '<b>Icon Class:</b> Icon of the Seas (el más grande). <b>Oasis Class:</b> Wonder, Symphony, Harmony (enormes). <b>Quantum:</b> Tecnológicos. <b>Freedom/Voyager:</b> Más económicos.'
                },
                {
                    title: '🏆 Mejores para familias',
                    content: '<b>Icon of the Seas</b> (WOW factor), <b>Wonder of the Seas</b> (enorme), <b>Symphony</b> (muy completo). Toboganes, FlowRider, pared escalar.'
                },
                {
                    title: '💰 Precios aproximados',
                    content: 'Desde <b>$400 USD/persona</b> (interior 3-4 noches) hasta <b>$3,000+ USD</b> (suite 7 noches). Con Kids Sail Free baja mucho.'
                },
                {
                    title: '🎁 Kids Sail Free',
                    content: '3er y 4to pasajero GRATIS (solo impuestos ~$150). Ahorro $800-1,500 USD. A veces + 30% off.'
                },
                {
                    title: '✅ Qué INCLUYE',
                    content: 'Comidas buffet y restaurante principal, shows, piscinas, gym, FlowRider, pared escalar, mini golf, kids clubs. Agua, café, té.'
                },
                {
                    title: '❌ Qué NO incluye',
                    content: 'Refrescos ($15/día), alcohol ($60-90/día), restaurantes especiales ($40-80), wifi ($15-20/día), excursiones, propinas ($16-18.50/persona/noche).'
                },
                {
                    title: '💳 Política de pagos',
                    content: '<b>Apartado:</b> $50-250 USD/persona. <b>Pago final:</b> 90 días antes.'
                }
            ]
        },
        disneyParks: {
            title: 'Parques Disney',
            icon: '🏰',
            sections: [
                {
                    title: '🏰 Disney World (Florida)',
                    content: '<b>Magic Kingdom:</b> Clásico, castillo. <b>EPCOT:</b> Futuro + países. <b>Hollywood Studios:</b> Star Wars, Toy Story. <b>Animal Kingdom:</b> Avatar, safari.'
                },
                {
                    title: '🎢 Disneyland (California)',
                    content: 'El ORIGINAL. 2 parques: Disneyland y California Adventure. Ideal viaje corto (2-3 días).'
                },
                {
                    title: '💰 Precios aproximados',
                    content: '<b>Boletos:</b> desde $109 USD/día hasta $180+ (Park Hopper). <b>Paquete 4 días + hotel:</b> desde $2,000-2,500 USD familia de 4.'
                },
                {
                    title: '⚡ Lightning Lane',
                    content: '<b>Multi Pass:</b> $15-35/día, 3 atracciones. <b>Single Pass:</b> $12-25 por atracción top. NO hay FastPass gratis.'
                },
                {
                    title: '🍽️ Restaurantes',
                    content: 'Reservar <b>60 días antes</b> a las 5:45 AM Orlando. Difíciles: Be Our Guest, Cinderella\'s Royal Table, Space 220.'
                },
                {
                    title: '📅 Mejor época',
                    content: '<b>EVITAR:</b> Semana Santa, verano, Navidad, Spring Break. <b>IDEAL:</b> Septiembre, enero (después del 7), febrero, mayo.'
                }
            ]
        },
        disneyHotels: {
            title: 'Hoteles Disney World',
            icon: '🏨',
            sections: [
                {
                    title: '💚 Value - desde $150/noche',
                    content: '<b>All-Star:</b> Básicos. <b>Pop Century:</b> Mejor value, Skyliner. <b>Art of Animation:</b> Suites familiares, muy temático.'
                },
                {
                    title: '💛 Moderate - desde $250/noche',
                    content: '<b>Caribbean Beach:</b> Skyliner, tropical. <b>Coronado Springs:</b> Más adulto. <b>Port Orleans:</b> Ambiente sureño.'
                },
                {
                    title: '💜 Deluxe - desde $500/noche',
                    content: '<b>Grand Floridian:</b> El más lujoso. <b>Contemporary:</b> Monorail. <b>Polynesian:</b> Playa. <b>Animal Kingdom Lodge:</b> Safari.'
                },
                {
                    title: '✅ Beneficios Disney',
                    content: '• Early Entry (30 min antes)<br>• Transporte gratuito<br>• Reservar Lightning Lane antes<br>• MagicBand+'
                }
            ]
        },
        seasons: {
            title: 'Temporadas',
            icon: '📅',
            sections: [
                {
                    title: '🔴 Alta (evitar)',
                    content: '• Semana Santa / Spring Break<br>• Verano (junio-agosto)<br>• Navidad (15 dic - 5 ene)<br>• Thanksgiving<br><br>Precios +40-60%, muy lleno.'
                },
                {
                    title: '🟢 Baja (ideal)',
                    content: '• Enero (después del 7)<br>• Febrero<br>• Septiembre (el mejor)<br>• Principios diciembre<br><br>Mejores precios, menos gente.'
                },
                {
                    title: '🟡 Media',
                    content: '• Octubre (Halloween)<br>• Noviembre<br>• Mayo<br>• Abril (fuera Semana Santa)<br><br>Balance precio/clima/gente.'
                }
            ]
        },
        salesTips: {
            title: 'Tips de Venta',
            icon: '💡',
            sections: [
                {
                    title: '💸 "Está muy caro"',
                    content: '• NUNCA justifiques el precio<br>• Enfócate en soluciones: pagos, fechas<br>• "¿Qué te funcionaría mejor?"<br>• El problema no es precio, es CÓMO pagarlo'
                },
                {
                    title: '⏳ Crear urgencia',
                    content: '• "Precios pueden cambiar"<br>• "Te guardo el precio sin compromiso"<br>• Menciona promos con fecha límite<br>• NUNCA presiones'
                },
                {
                    title: '🚫 Qué NUNCA decir',
                    content: '• "Es caro pero vale la pena"<br>• "No sé, déjame investigar"<br>• Precio sin contexto<br>• Criticar competencia'
                },
                {
                    title: '🤝 Tu valor',
                    content: '• Mismo precio que directo<br>• Monitoreas bajadas<br>• Ayudas con todo<br>• Soporte siempre<br>• "Mismo precio, cero estrés"'
                }
            ]
        }
    },
    
    // ===== CHECKLIST DATOS CLIENTE =====
    clientChecklist: [
        { id: 'names', text: 'Nombres completos (pasaporte/INE)', required: true },
        { id: 'birthdays', text: 'Fechas de nacimiento', required: true },
        { id: 'email', text: 'Correo electrónico', required: true },
        { id: 'phone', text: 'Teléfono / WhatsApp', required: true },
        { id: 'passport', text: 'Número de pasaporte (viaje internacional)', required: false },
        { id: 'passportExp', text: 'Vencimiento pasaporte (6+ meses)', required: false },
        { id: 'address', text: 'Dirección (facturación)', required: false },
        { id: 'special', text: 'Requerimientos especiales', required: false }
    ]
};

// Hacer disponible globalmente
window.Data = Data;
