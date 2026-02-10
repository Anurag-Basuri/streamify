export class TtlCache {
    constructor({ ttlMs, maxEntries = 500 } = {}) {
        this.ttlMs = typeof ttlMs === "number" ? ttlMs : 30_000;
        this.maxEntries = maxEntries;
        this.store = new Map();
    }

    get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.value;
    }

    set(key, value, ttlOverrideMs) {
        const ttlMs =
            typeof ttlOverrideMs === "number" ? ttlOverrideMs : this.ttlMs;

        if (this.store.size >= this.maxEntries) {
            // Evict oldest insertion to keep it simple and predictable.
            const oldestKey = this.store.keys().next().value;
            if (oldestKey !== undefined) this.store.delete(oldestKey);
        }

        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }

    delete(key) {
        this.store.delete(key);
    }

    clear() {
        this.store.clear();
    }
}
