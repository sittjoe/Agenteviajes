/**
 * Data Manager - Backup & Restore
 * Handles export and import of application data
 */

Object.assign(App, {
    // ===== EXPORT =====
    exportAllData() {
        try {
            const data = {
                version: '2.0',
                timestamp: new Date().toISOString(),
                config: Storage.getConfig(),
                quotes: Storage.getQuotes(),
                clients: CRM.getClients(),
                favorites: Storage.getFavorites(),
                recents: Storage.getRecents(),
                stats: Storage.getStats()
            };

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_magia_disney_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('✅ Datos exportados correctamente', 'success');
        } catch (err) {
            console.error('Export error:', err);
            this.showToast('❌ Error al exportar datos', 'error');
        }
    },

    // ===== IMPORT =====
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Basic validation
                if (!data.version || !data.quotes || !data.clients) {
                    throw new Error('Formato de archivo inválido');
                }

                if (!confirm('⚠️ Esto reemplazará todos tus datos actuales. ¿Estás seguro?')) {
                    event.target.value = ''; // Reset input
                    return;
                }

                // Restore data
                if (data.config) Storage.saveConfig(data.config);
                if (data.quotes) localStorage.setItem('quotes', JSON.stringify(data.quotes));
                if (data.clients) localStorage.setItem('clients', JSON.stringify(data.clients));
                if (data.favorites) localStorage.setItem('favorites', JSON.stringify(data.favorites));
                if (data.recents) localStorage.setItem('recents', JSON.stringify(data.recents));
                if (data.stats) localStorage.setItem('stats', JSON.stringify(data.stats));

                this.showToast('✅ Datos restaurados correctamente', 'success');

                // Reload app to reflect changes
                setTimeout(() => window.location.reload(), 1500);

            } catch (err) {
                console.error('Import error:', err);
                this.showToast('❌ Error al importar: Archivo inválido', 'error');
            }

            event.target.value = ''; // Reset input
        };
        reader.readAsText(file);
    },

    // ===== CLEAR DATA =====
    clearAllData() {
        if (confirm('⚠️ ¿ESTÁS SEGURO? Se borrarán TODAS las cotizaciones, clientes y configuraciones. Esta acción NO se puede deshacer.')) {
            localStorage.clear();
            this.showToast('🗑️ Todos los datos eliminados', 'success');
            setTimeout(() => window.location.reload(), 1500);
        }
    }
});
