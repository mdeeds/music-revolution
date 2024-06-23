class PeerConnector extends EventTarget {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.otherIds = new Set();
        this.outboundConnections = new Map();
    }

    async start() {
        return new Promise((resolve, reject) => {
            console.log(`Starting peer connections.`);
            // Initialize PeerJS connection
            this.peer = new Peer();
            this.peer.on('open', () => {
                bigMessage('Connection open...');

                // Attempt to connect to existing session
                const conn = this.peer.connect(this.sessionId);
                conn.on('open', () => {
                    bigMessage('Connected.');
                    console.log(`I am ${this.peer.id}`);
                    // Connected to existing session, send name
                    this.isServer = false;
                    this.outboundConnections.set(this.sessionId, conn);

                    this.setUpPeerEvents();
                    conn.send({ type: 'meet', id: this.peer.id});
                    resolve();
                });
                conn.on('error', (err) => { fatal(err); });
            });
            this.peer.on('connection', () => { console.log('AAAAA connection'); });
            this.peer.on('close', () => { console.log('AAAAA close'); });
            this.peer.on('call', () => { console.log('AAAAA call'); });
            this.peer.on('disconnected', () => { console.log('AAAAA disconnected'); });
            this.peer.on('error', (err) => {
                if (this.isServer === undefined) {
                    bigMessage('Starting server...');
                    this.peer.on('error', (err) => { fatal(err); });
                    this.peer = new Peer(this.sessionId);
                    this.setUpPeerEvents();
                    this.isServer = true;
                    this.peer.on('open', () => {
                        bigMessage(`Server ready.`);
                        resolve();
                    });
                } else {
                    reject(err);
                }
            });
        });        
    }
    
    setUpPeerEvents() {
        // Handle incoming connections
        this.peer.on('connection', (conn) => {
            this.otherIds.add(conn.peer);
            conn.on('data', (data) => {
                console.log(`Incoming data: ${JSON.stringify(data)} from ${conn.peer}`);
                if (data.type === 'meet') {
                    this.otherIds.add(data.id);
                    this.broadcast({ type: 'hello' });
                    if (this.isServer) {
                        // If we are the hub, broadcast this meet to everyone.
                        this.broadcast(data);
                    }
                } else if (data.type === 'hello') {
                    // Proactively open a connection if we don't have one.
                    const outboundConn = this.outboundConnections.get(conn.peer);
                    if (!outboundConn || !outboundConn.open) {
                        const newConnection = this.peer.connect(conn.peer);
                        newConnection.on('open', () => {
                            this.outboundConnections.set(peerId, newConnection);
                        });
                    }
                } else {
                    // Dispatch 'data' event for other messages.
                    const dataEvent = new CustomEvent('data', {
                        detail: data },
                    });
                    this.dispatchEvent(dataEvent);
                }
            });
        });
    }

    broadcast(data) {
        console.log(
            `Broadcast: ${JSON.stringify(data)} to ${[...this.otherIds].join(", ")}`);
        // Send data to all known peers
        for (const peerId of this.otherIds) {
            if (peerId === this.peer.id) {
                // Don't broadcast messages to yourself.
                continue;
            }
            const conn = this.outboundConnections.get(peerId);
            if (!!conn && conn.open) {
                console.log(`AAAAA Already open to ${peerId}`);
                conn.send(data);
            } else  {
                console.log(`Opening new connection to ${peerId}`);
                const newConnection = this.peer.connect(peerId);
                newConnection.on('open', () => {
                    console.log(`AAAAA New connection opened to ${peerId}`);
                    if (!newConnection.open) { fatal('Not open.'); }
                    newConnection.send(data);
                    this.outboundConnections.set(peerId, newConnection);
                });
                newConnection.on('data', () => { console.log('AAAAA data'); })
                newConnection.on('close', () => { console.log('AAAAA close'); })
                newConnection.on('error', (err) => { console.log(`AAAAA error ${err}`); })
            }
        }
    }
}
