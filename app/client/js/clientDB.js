class ClientDB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ClientDB', 1);

            request.onerror = function (event) {
                console.log("Unable to open IndexedDB:", event.target.error);
                reject(event.target.error);
            };

            request.onupgradeneeded = function (event) {
                this.db = event.target.result;
                if (!this.db.objectStoreNames.contains('clientDataStore')) {
                    this.db.createObjectStore('clientDataStore', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("IndexedDB opened successfully");
                resolve();
            };
        });
    }

    async saveClientData(key, data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['clientDataStore'], 'readwrite');
                const store = transaction.objectStore('clientDataStore');

                // Delete the old data with the same key
                store.delete(key);

                // Save the entire data array as a single record with the provided key
                store.put({ id: key, data: data });

                transaction.oncomplete = function () {
                    console.log('Client data saved to IndexedDB');
                    resolve();
                };

                transaction.onerror = function () {
                    reject(new Error("An error occurred while saving data to IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }

    async getClientData(key) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['clientDataStore'], 'readonly');
                const store = transaction.objectStore('clientDataStore');
                const request = store.get(key);

                request.onsuccess = function (event) {
                    const data = event.target.result;
                    if (data === undefined) {
                        reject(new Error(`No data found for key: ${key}`));
                    } else {
                        console.log('Client data retrieved from IndexedDB');
                        resolve(data.data);
                    }
                };

                request.onerror = function (event) {
                    reject(new Error("An error occurred while fetching data from IndexedDB"));
                };

            } catch (error) {
                console.error(error);
                reject(new Error('An unexpected error occurred: ' + error));
            }
        });
    }
}