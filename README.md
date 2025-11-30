# Magia Disney & Royal

Plataforma profesional para cotizaciones de viajes Disney y Royal Caribbean. PWA optimizada para iPhone y desktop con diseño neutral profesional.

## 🚀 URL en Producción

**https://sittjoe.github.io/Agenteviajes/**

## ✨ Características Principales

- **Cotizador Profesional:** Crea cotizaciones detalladas en segundos
- **CRM Integrado:** Gestión completa de clientes con historial
- **Pipeline de Ventas:** Tablero Kanban visual para seguimiento
- **Analytics Dashboard:** KPIs y gráficos de rendimiento
- **PWA Offline:** Funciona completamente sin conexión
- **Exportación PDF:** Cotizaciones profesionales listas para enviar
- **WhatsApp Integration:** Comparte cotizaciones directamente
- **Dark Mode:** Modo oscuro automático
- **Touch Optimized:** Todos los elementos ≥44px (Apple HIG)
- **Safe Area Support:** Compatible con notch de iPhone

## 🎨 Diseño Profesional

**Paleta de Colores:**
- Primario: `#f59e0b` (Amber cálido)
- Neutros: Familia de grises piedra (`#fafaf9` → `#1c1917`)
- Success: `#10b981` (Emerald)
- Danger: `#ef4444` (Red)
- WhatsApp: `#25D366`

**Características de UI:**
- Diseño neutral y profesional
- Typography: Inter (Google Fonts)
- Spacing: 8px grid system
- Shadows: Sutiles y neutrales
- Responsive: Mobile-first design

## 📱 Compatibilidad Mobile

Optimizado para todos los tamaños de iPhone:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone Pro Max (428px)
- iPad (768px+)
- Desktop (1024px+)

## 🚀 Despliegue en GitHub Pages

### Configuración Automática

La aplicación está **lista para GitHub Pages**. Solo sigue estos pasos:

1. **Push al repositorio:**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

2. **Habilitar GitHub Pages:**
   - Ve a: `Settings` → `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main` / `root`
   - Click `Save`

3. **Esperar 1-2 minutos** y visita:
   `https://sittjoe.github.io/Agenteviajes/`

### Archivos de Configuración

- ✅ `.nojekyll` - Evita procesamiento Jekyll
- ✅ `manifest.json` - Configurado con rutas relativas
- ✅ `sw.js` - Service Worker con soporte BASE_PATH
- ✅ Todas las rutas son relativas (compatibles con subcarpetas)

## 💻 Desarrollo Local

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx serve

# Opción 3: VS Code Live Server
# Instala extensión "Live Server" → Click derecho → "Open with Live Server"
```

Luego abre: `http://localhost:8000`

## 📦 Estructura del Proyecto

```
/Agenteviajes/
├── index.html          # App principal
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── .nojekyll          # GitHub Pages config
│
├── css/
│   ├── styles.css     # Estilos principales (38KB)
│   └── print.css      # Estilos de impresión
│
├── js/                # 18 módulos JavaScript
│   ├── app.js         # Controlador principal
│   ├── storage.js     # LocalStorage manager
│   ├── quotes.js      # Gestión cotizaciones
│   ├── crm.js         # CRM
│   ├── analytics.js   # Analytics
│   ├── pipeline.js    # Kanban board
│   └── ...
│
└── assets/            # Imágenes y logos
```

## 📱 Instalar como App

**iPhone (Safari):**
1. Abre `https://sittjoe.github.io/Agenteviajes/`
2. Toca botón "Compartir" (⬆️)
3. Selecciona "Añadir a pantalla de inicio"
4. ¡Listo! App instalada con ícono ámbar

**Android (Chrome):**
1. Abre la URL en Chrome
2. Menú (⋮) → "Instalar aplicación"
3. App instalada y funcionando offline

## 🛠️ Tecnologías

- **Frontend:** Vanilla JavaScript (sin frameworks)
- **Estilos:** CSS Custom Properties
- **PWA:** Service Worker + Cache API
- **Persistencia:** LocalStorage
- **Charts:** Chart.js
- **PDF:** jsPDF + AutoTable
- **QR Codes:** QRCode.js

## 🔧 Configuración PWA

**Service Worker (`sw.js`):**
- Cache version: `v2.0.0`
- Estrategia: Cache-first con network fallback
- Assets cacheados: 25+ archivos críticos
- Soporte para subcarpetas (GitHub Pages)

**Manifest (`manifest.json`):**
- Display: `standalone` (sin browser UI)
- Orientation: `portrait-primary`
- Theme color: `#f59e0b` (Amber)
- Background: `#fafaf9` (Warm neutral)

## 🎯 Funcionalidades

1. **Cotizaciones:**
   - Crear, editar, duplicar
   - Multi-pasajero con edades
   - Plan de pagos flexible
   - Estados: Draft, Sent, Negotiating, Accepted, Rejected

2. **CRM:**
   - Base de datos de clientes
   - Estados: Lead, Cliente, VIP
   - Timeline de actividades
   - Tags personalizados

3. **Analytics:**
   - KPIs en tiempo real
   - Gráficos interactivos (Chart.js)
   - Filtros por período
   - Métricas de conversión

4. **Templates:**
   - Respuestas por etapa de venta
   - Info de productos
   - Tips de ventas
   - Guías visuales

5. **Exportación:**
   - PDF profesional
   - WhatsApp directo
   - Backup JSON completo

## 📝 Notas de Versión

**v2.0.0 (Noviembre 2024)**
- ✅ Rediseño completo con paleta neutral profesional
- ✅ Optimización iPhone (safe areas, touch targets)
- ✅ GitHub Pages ready
- ✅ Service Worker actualizado
- ✅ CSS consolidado (eliminados archivos no usados)
- ✅ Bottom nav mejorada con glassmorphism
- ✅ Breakpoints para todos los iPhone
- ✅ Dark mode refinado

---

**Versión:** 2.0.0
**Desarrollado para:** Magia Disney & Royal
**Diseño:** Profesional neutral con acentos ámbar
