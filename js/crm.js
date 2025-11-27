/**
 * CRM - Client Relationship Management Module
 * Sprint 3: Pasos 021-030
 */

const CRM = {

    /**
     * Paso 021-022: Client database structure and operations
     */
    getClients() {
        return Storage.get('clients') || [];
    },

    saveClients(clients) {
        Storage.set('clients', clients);
    },

    getClientById(id) {
        return this.getClients().find(c => c.id === id);
    },

    createClient(data) {
        const clients = this.getClients();
        const client = {
            id: 'CLI-' + Date.now(),
            name: data.name,
            email: data.email || '',
            phone: data.phone || '',
            tags: data.tags || [],
            status: data.status || 'lead', // lead, cliente, vip
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            timeline: [],
            customFields: data.customFields || {}
        };

        client.timeline.push({
            id: 'TL-' + Date.now(),
            type: 'created',
            description: 'Cliente creado',
            date: new Date().toISOString()
        });

        clients.push(client);
        this.saveClients(clients);
        return client;
    },

    updateClient(id, updates) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === id);

        if (index === -1) return null;

        clients[index] = {
            ...clients[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveClients(clients);
        return clients[index];
    },

    deleteClient(id) {
        const clients = this.getClients().filter(c => c.id !== id);
        this.saveClients(clients);
    },

    /**
     * Paso 026: Timeline management
     */
    addTimelineEvent(clientId, event) {
        const client = this.getClientById(clientId);
        if (!client) return;

        const timelineEvent = {
            id: 'TL-' + Date.now(),
            type: event.type || 'note', // note, quote, call, email, meeting
            description: event.description,
            date: event.date || new Date().toISOString(),
            metadata: event.metadata || {}
        };

        client.timeline = client.timeline || [];
        client.timeline.unshift(timelineEvent);

        this.updateClient(clientId, { timeline: client.timeline });
    },

    /**
     * Paso 027: Tags and categories
     */
    addTag(clientId, tag) {
        const client = this.getClientById(clientId);
        if (!client) return;

        if (!client.tags.includes(tag)) {
            client.tags.push(tag);
            this.updateClient(clientId, { tags: client.tags });
        }
    },

    removeTag(clientId, tag) {
        const client = this.getClientById(clientId);
        if (!client) return;

        client.tags = client.tags.filter(t => t !== tag);
        this.updateClient(clientId, { tags: client.tags });
    },

    getAllTags() {
        const clients = this.getClients();
        const tagsSet = new Set();
        clients.forEach(c => c.tags.forEach(t => tagsSet.add(t)));
        return Array.from(tagsSet);
    },

    /**
     * Paso 024: Search and filter
     */
    searchClients(query) {
        const clients = this.getClients();
        const lowerQuery = query.toLowerCase();

        return clients.filter(client =>
            client.name.toLowerCase().includes(lowerQuery) ||
            client.email.toLowerCase().includes(lowerQuery) ||
            client.phone.includes(query) ||
            client.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    filterByStatus(status) {
        return this.getClients().filter(c => c.status === status);
    },

    filterByTags(tags) {
        return this.getClients().filter(c =>
            tags.some(tag => c.tags.includes(tag))
        );
    },

    /**
     * Paso 030: Export to CSV
     */
    exportToCSV() {
        const clients = this.getClients();

        const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Tags', 'Creado', 'Última actualización'];
        const rows = clients.map(c => [
            c.id,
            c.name,
            c.email,
            c.phone,
            c.status,
            c.tags.join('; '),
            new Date(c.createdAt).toLocaleDateString('es-MX'),
            new Date(c.updatedAt).toLocaleDateString('es-MX')
        ]);

        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `clientes-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Get client stats
     */
    getClientStats() {
        const clients = this.getClients();
        const quotes = Storage.getQuotes();

        return {
            total: clients.length,
            leads: clients.filter(c => c.status === 'lead').length,
            clients: clients.filter(c => c.status === 'cliente').length,
            vips: clients.filter(c => c.status === 'vip').length,
            quotesPerClient: quotes.length / (clients.length || 1),
            recentActivity: clients.filter(c => {
                const daysSinceUpdate = (Date.now() - new Date(c.updatedAt)) / (1000 * 60 * 60 * 24);
                return daysSinceUpdate <= 7;
            }).length
        };
    },

    /**
     * Link quote to client
     */
    linkQuoteToClient(clientId, quoteId) {
        this.addTimelineEvent(clientId, {
            type: 'quote',
            description: `Cotización ${quoteId} creada`,
            metadata: { quoteId }
        });
    },

    /**
     * Get quotes for client
     */
    getClientQuotes(clientId) {
        const client = this.getClientById(clientId);
        if (!client) return [];

        const quotes = Storage.getQuotes();
        return quotes.filter(q =>
            q.client?.name === client.name ||
            q.client?.email === client.email ||
            q.client?.phone === client.phone
        );
    }
};

// Auto-link quotes to clients when saving
const originalSaveQuote = Storage.saveQuote;
Storage.saveQuote = function (quote) {
    const result = originalSaveQuote.call(this, quote);

    // Try to find or create client
    if (quote.client && quote.client.name) {
        let clients = CRM.getClients();
        let client = clients.find(c =>
            c.name === quote.client.name ||
            (quote.client.email && c.email === quote.client.email) ||
            (quote.client.phone && c.phone === quote.client.phone)
        );

        if (!client) {
            // Create new client from quote
            client = CRM.createClient({
                name: quote.client.name,
                email: quote.client.email || '',
                phone: quote.client.phone || '',
                status: 'lead'
            });
        }

        // Link quote to client
        CRM.linkQuoteToClient(client.id, quote.id);
    }

    return result;
};
