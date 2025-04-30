// server.js: Enhanced WebSocket echo server with subprotocol support and logging
const WebSocket = require('ws');

// List of supported subprotocols
const SUPPORTED_PROTOCOLS = new Set([
  'graphql-ws',
  'graphql-transport-ws',
  'json',
  'custom-proto-1',
  'synapse-contentType-application-json',
  'synapse-contentType_application_json'
]);

// Create WebSocket server on port 8080
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
  return false;
}



});

wss.on('listening', () => {
  console.log('✅ WebSocket echo server listening on ws://localhost:8080');
});

wss.on('connection', (socket, request) => {
  const connectionId = Math.random().toString(36).substring(2, 8);
  const clientIp = request.socket.remoteAddress;

  console.log(`\n[${connectionId}] 🔗 New connection from ${clientIp}`);
  console.log(`[${connectionId}] Raw Sec-WebSocket-Protocol header:`, request.headers['sec-websocket-protocol'] || '(none)');
  console.log(`[${connectionId}] Negotiated subprotocol:`, socket.protocol || '(none)');

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'welcome',
    protocol: socket.protocol || null,
    time: new Date().toISOString()
  }));

  // Echo messages or custom protocol behavior
  socket.on('message', (msg) => {
    const text = msg.toString();
    console.log(`[${connectionId}] 📩 Received: ${text}`);

    if (socket.protocol === 'graphql-ws') {
      socket.send(JSON.stringify({ type: 'GQL_ACK', payload: text }));
    } else {
      socket.send(text);
    }
  });

  // Send periodic ping
  const interval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, 10000); // every 10 seconds

  socket.on('close', (code, reason) => {
    clearInterval(interval);
    console.log(`[${connectionId}] 🔒 Connection closed (code=${code}, reason=${reason || '(none)'})`);
  });

  socket.on('pong', () => {
    console.log(`[${connectionId}] 🏓 Pong received`);
  });

  socket.on('error', (err) => {
    console.error(`[${connectionId}] ❗ Error:`, err.message);
  });
});

// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🔻 Server shutting down...');
  wss.clients.forEach((client) => client.close(1001, 'Server shutting down'));
  process.exit();
});
