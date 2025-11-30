/**
 * PWA & Performance Module
 * Sprint 10: Pasos 091-100
 */

// Service Worker registration
const PWA = {

    /**
     * Paso 091-096: Register Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const swUrl = new URL('sw.js', window.location.href);
                const registration = await navigator.serviceWorker.register(swUrl.pathname);
                console.log('✅ Service Worker registered:', registration);

                registration.addEventListener('updatefound', () => {
                    if (window.App?.showToast) {
                        App.showToast('🔄 Nueva versión disponible. Recarga para actualizar.', 'info', 5000);
                    }
                });

                return registration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    },

    /**
     * Paso 098: Cloud backup (preparation)
     */
    async backupToCloud() {
        const data = {
            quotes: Storage.getQuotes(),
            clients: CRM?.getClients() || [],
            config: Storage.getConfig(),
            timestamp: new Date().toISOString()
        };

        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });

        // Download as backup file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `magia-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        return data;
    },

    async restoreFromBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.quotes) Storage.set('quotes', data.quotes);
                    if (data.clients) Storage.set('clients', data.clients);
                    if (data.config) Storage.set('config', data.config);

                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    },

    /**
     * Paso 092-093: IndexedDB migration (helper)
     */
    async migrateToIndexedDB() {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported');
            return;
        }

        // Future: migrate from localStorage to IndexedDB
        // For now, just ensure localStorage is working
        return true;
    },

    /**
     * Check if app is installable
     */
    isInstallable() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');
    },

    /**
     * Initialize PWA features
     */
    init() {
        this.registerServiceWorker();

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;

            // Show install button
            const installBtn = document.getElementById('install-app-btn');
            if (installBtn) {
                installBtn.style.display = 'block';
                installBtn.onclick = async () => {
                    e.prompt();
                    const { outcome } = await e.userChoice;
                    if (outcome === 'accepted') {
                        console.log('✅ App installed');
                    }
                    window.deferredPrompt = null;
                };
            }
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
        });
    }
};

/**
 * Performance optimizations
 * Paso 093-095
 */
const Performance = {

    /**
     * Lazy load images
     */
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    /**
     * Compress and optimize assets
     */
    compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    /**
     * Debounce helper
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Monitor performance
     */
    measurePerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: perfData.loadEventEnd - perfData.fetchStart,
                domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime
            };
        }
        return null;
    },

    /**
     * Initialize performance optimizations
     */
    init() {
        this.initLazyLoading();

        // Log performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const metrics = this.measurePerformance();
                console.log('📊 Performance metrics:', metrics);
            }, 0);
        });
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        PWA.init();
        Performance.init();
    });
}
