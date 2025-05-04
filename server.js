const WebSocket = require('ws');

// Supported subprotocols
const SUPPORTED_PROTOCOLS = new Set([
  'graphql-ws',
  'graphql-transport-ws',
  'json',
  'custom-proto-1',
  'charith',
  'testValue'
]);

// Create WebSocket server with strict protocol handling
const wss = new WebSocket.Server({
  port: 8080,
  handleProtocols: (protocols, request) => {
    const protocolList = Array.isArray(protocols) ? protocols : Array.from(protocols);

    console.log('📥 handleProtocols called with:', protocolList);
    console.log('🔍 Looking for match in:', Array.from(SUPPORTED_PROTOCOLS));

    for (const p of protocolList) {
      console.log(`🔍 Checking if supported: "${p}"`);
      if (SUPPORTED_PROTOCOLS.has(p)) {
        console.log(`✅ Match found: "${p}"`);
        return p;
      }
    }

    console.warn(`❌ No supported subprotocol found in [${protocolList.join(', ')}]`);
    return false; // ❌ Reject handshake (client will get HTTP 400)
  }
});

wss.on('listening', () => {
  console.log('✅ WebSocket server listening on ws://localhost:8080');
});

wss.on('connection', (socket, request) => {
  const connectionId = Math.random().toString(36).substring(2, 8);
  const clientIp = request.socket.remoteAddress;
  const clientProtocol = socket.protocol;

  console.log(`\n[${connectionId}] 🔗 New connection from ${clientIp}`);
  console.log(`[${connectionId}] Raw Sec-WebSocket-Protocol header:`, request.headers['sec-websocket-protocol'] || '(none)');
  console.log(`[${connectionId}] Negotiated subprotocol:`, clientProtocol || '(none)');

  // 🔐 Enforce strict protocol match even if client sent none
  if (!clientProtocol || !SUPPORTED_PROTOCOLS.has(clientProtocol)) {
    console.warn(`[${connectionId}] ❌ Unsupported or missing subprotocol. Closing connection.`);
    socket.close(1001, 'Unsupported or missing subprotocol'); // Protocol error
    return;
  }

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'welcome',
    protocol: clientProtocol,
    time: new Date().toISOString()
  }));

  socket.on('message', (msg) => {
    const text = msg.toString();
    console.log(`[${connectionId}] 📩 Received: ${text}`);

    if (clientProtocol === 'graphql-ws') {
      socket.send(JSON.stringify({ type: 'GQL_ACK', payload: text }));
    } else {
      socket.send(text); // echo back
    }
  });

  // Ping every 10 seconds
  const interval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, 10000);

  socket.on('pong', () => {
    console.log(`[${connectionId}] 🏓 Pong received`);
  });

  socket.on('close', (code, reason) => {
    clearInterval(interval);
    console.log(`[${connectionId}] 🔒 Connection closed (code=${code}, reason=${reason || '(none)'})`);
  });

  socket.on('error', (err) => {
    console.error(`[${connectionId}] ❗ Error:`, err.message);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔻 Server shutting down...');
  wss.clients.forEach(client => client.close(1001, 'Server shutting down'));
  process.exit();
});
