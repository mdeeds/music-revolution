class DistributedStore {
    constructor(store, peerConnector) {
        this.store = store;
        this.peerConnector = peerConnector;
        this.peerConnector.addEventListener('data', this._handleData.bind(this));
    }

    // Overwrites the set method of the Store class
    set(key, value) {
        this.store.set(key, value);
        this._broadcastChange(key, value);
    }

    // Broadcast changes to other peers
    async _broadcastChange(key, value) {
        if (value instanceof Float32Array) {
            const encodedValue = encodeAudioAsPNG(value, 128); // Encode as PNG
            this.peerConnector.broadcast({
                type: 'store-update',
                key,
                value: encodedValue,
                length: value.length });
        } else {
            this.peerConnector.broadcast({ type: 'store-update', key, value });
        }
    }

    // Handle data received from other peers
    async _handleData(event) {
        const data = event.detail;
        let value = data.value;
        if (data.type === 'store-update') {
            if (typeof data.value === 'string' && data.length > 0) {
                // Decode PNG to Float32Array
                const decodedValue = await decodePNGToAudio(data.value, data.length); 
                this.store.set(data.key, decodedValue);
                value = decodedValue;
            } else {
                this.store.set(data.key, data.value);
            }
            this._raiseChangeEvent(data.key, value);
        }
    }

    // Raise a 'change' event
    _raiseChangeEvent(key, value) {
        const changeEvent = new CustomEvent('change', {
            detail: { key, value },
        });
        this.dispatchEvent(changeEvent);
    }
}
