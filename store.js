// This implements a write-through map which persists the key-value
// pairs in an indexeddb. 'get' and 'set' operations are performed
// synchronously in memory, and the 'set' operation will write through
// to the database in the background. When creating an instance of the
// store, it will populate the in-memory map with all of the key-value
// pairs from the database.
class Store {
    constructor(storeName, dbName) {
        this.storeName = storeName;
        this.dbName = dbName;
        this.inMemoryMap = new Map();
        this.db = null;
    }

    static async create(storeName, dbName) {
        const dbMap = new Store(storeName, dbName);
        await dbMap._openDatabase();
        await dbMap._loadKeys(); // Load keys into in-memory map
        return dbMap;
    }

    async _openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName);
                    store.createIndex('key', 'key', { unique: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async _loadKeys() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();

            request.onsuccess = (event) => {
                const keys = event.target.result;
                // Load values into the in-memory map from the database
                const valueRequests = keys.map(key => {
                    return new Promise((resolve, reject) => {
                        const valueRequest = store.get(key);
                        valueRequest.onsuccess = (event) => {
                            this.inMemoryMap.set(key, event.target.result);
                            resolve();
                        };
                        valueRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });
                });

                Promise.all(valueRequests)
                    .then(() => resolve())
                    .catch(reject);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // Get is served from an in-memory map and can always be accessed
    // synchronously
    get(key) {
        if (this.inMemoryMap.has(key)) {
            return this.inMemoryMap.get(key);
        } else {
            return undefined;
        }
    }

    // Set is a synchronous method - it does not return a promise.  It
    // will write-through to the database, but this is done
    // asynchronously and there is no need to wait for it.
    set(key, value) {
        this.inMemoryMap.set(key, value);
        this._writeThrough(key, value);
    }

    async _writeThrough(key, value) {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put(value, key);
    }

    clear() {
        this.inMemoryMap.clear();
        this.db.transaction(this.storeName, 'readwrite').objectStore(this.storeName).clear();
    }
}
