# Magia Disney & Royal - Agente de Viajes PWA

Una aplicación web progresiva (PWA) profesional diseñada para agentes de viajes especializados en Disney y Royal Caribbean. Gestiona clientes, cotizaciones y pipeline de ventas con una interfaz premium.

## Características

-   **Cotizador Rápido:** Crea cotizaciones detalladas en segundos.
-   **CRM Integrado:** Gestión de clientes con historial y perfiles.
-   **Pipeline de Ventas:** Tablero Kanban para visualizar el estado de tus ventas.
-   **Analytics:** Dashboard con KPIs y gráficos de rendimiento.
-   **Modo Offline:** Funciona sin internet gracias a su arquitectura PWA.
-   **Exportación PDF:** Genera cotizaciones listas para imprimir o enviar.
-   **Respaldo de Datos:** Exporta e importa toda tu información en formato JSON.

## Instalación (Desarrollo Local)

1.  Clona este repositorio o descarga los archivos.
2.  Abre la carpeta en tu editor de código favorito (VS Code recomendado).
3.  Usa una extensión como "Live Server" para servir los archivos (necesario para Service Workers y módulos ES6).

## Despliegue (Producción)

Esta aplicación es estática (HTML/CSS/JS), por lo que se puede desplegar fácilmente en cualquier hosting estático.

### GitHub Pages
1.  Sube los archivos a un repositorio de GitHub.
2.  Ve a `Settings` > `Pages`.
3.  Selecciona la rama `main` y la carpeta `/root`.
4.  ¡Listo! Tu app estará disponible en `https://usuario.github.io/repo`.

### Netlify / Vercel
1.  Conecta tu repositorio.
2.  Configura el directorio de publicación como la raíz (`.`).
3.  Despliega.

## Estructura del Proyecto

-   `index.html`: Punto de entrada principal.
-   `css/`: Estilos (Base, Premium, Print).
-   `js/`: Lógica de la aplicación (App, CRM, Pipeline, UI).
-   `assets/`: Imágenes e iconos.

## Tecnologías

-   HTML5, CSS3 (Variables, Grid, Flexbox)
-   JavaScript (ES6+, Módulos)
-   Chart.js (Gráficos)
-   LocalStorage (Persistencia de datos)

## Créditos

Desarrollado para Magia Disney & Royal.
