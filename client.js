// client.js: Enhanced WebSocket client for subprotocol testing
const WebSocket = require('ws');

const results = [];

// Helper to perform one connection test
function testConnection(name, url, protocols) {
  return new Promise((resolve) => {
    console.log(`\n--- Test: ${name} ---`);
    console.log(`🌐 Connecting to ${url}`);
    console.log(`📦 Requested subprotocols:`, protocols || '(none)');

    let ws;
    try {
      ws = new WebSocket(url, protocols || []);
    } catch (err) {
      console.error(`❌ Failed to initiate connection: ${err.message}`);
      results.push({ name, success: false, error: err.message });
      return resolve();
    }

    ws.on('open', () => {
      console.log('✅ Connection open');
      console.log(`🔄 Negotiated subprotocol: ${ws.protocol || '(none)'}`);

      if (protocols?.length) {
        if (!ws.protocol) {
          console.warn('⚠️ No subprotocol was negotiated despite being requested.');
        } else if (!protocols.includes(ws.protocol)) {
          console.warn(`⚠️ Negotiated subprotocol (${ws.protocol}) wasn't among requested: ${protocols}`);
        }
      }

      // Choose message to send based on protocol
      const payload = {
        'graphql-ws': JSON.stringify({ type: 'GQL_START', payload: { query: '{ test }' } }),
        'json': JSON.stringify({ event: 'ping' }),
        'default': `Hello from client (${name})`
      };
      const toSend = payload[ws.protocol] || payload.default;
      ws.send(toSend);
    });

    ws.once('message', (message) => {
      const text = message.toString();
      try {
        const parsed = JSON.parse(text);
        console.log(`📩 Received JSON:`, parsed);
      } catch {
        console.log(`📩 Received:`, text);
      }

      // Close after short delay to allow log flushing
      setTimeout(() => ws.close(), 300);
    });

    ws.on('close', (code, reason) => {
      console.log(`🔒 Connection closed (code=${code}, reason=${reason || '(no reason)'})`);
      results.push({ name, success: true, protocol: ws.protocol || '(none)' });
      resolve();
    });

    ws.on('error', (err) => {
      console.error('❗ Connection error:', err.message);
      results.push({ name, success: false, error: err.message });
      resolve();
    });
  });
}

async function runTests() {
  const apiWsUrl = 'ws://localhost:8080/echo'; // Change to WSO2 gateway URL if needed

  await testConnection('Single-valid', apiWsUrl, ['json']);
  await testConnection('Multiple-with-supported', apiWsUrl, ['foo', 'graphql-transport-ws', 'bar']);
  await testConnection('All-unsupported', apiWsUrl, ['foo', 'bar']);
  await testConnection('No-protocol', apiWsUrl, null);
  await testConnection('Custom-content-type', apiWsUrl, ['synapse-contentType-application-json']);
  await testConnection('Custom-proto-sanitized', apiWsUrl, ['synapse-contentType_application_json']);

  console.log('\n📊 Test Summary:');
  results.forEach((r) => {
    if (r.success) {
      console.log(`✅ ${r.name}: subprotocol = ${r.protocol}`);
    } else {
      console.log(`❌ ${r.name}: ${r.error}`);
    }
  });
}

runTests();
