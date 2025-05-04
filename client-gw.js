const WebSocket = require('ws');

const AUTH_TOKEN = '<token-here>';
const results = [];

function testConnection(name, url, protocols) {
  return new Promise((resolve) => {
    console.log(`\n--- Test: ${name} ---`);
    console.log(`🌐 Connecting to ${url}`);
    console.log(`📦 Requested subprotocols:`, protocols || '(none)');

    let ws;
    let resultLogged = false;

    try {
      ws = new WebSocket(url, protocols || [], {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`
        }
      });
    } catch (err) {
      results.push({ name, success: false, error: `Connection error: ${err.message}` });
      return resolve();
    }

    let receivedMessage = false;

    ws.on('open', () => {
      console.log('✅ Connection open');
      console.log(`🔄 Negotiated subprotocol: ${ws.protocol || '(none)'}`);

      const payloads = {
        'graphql-ws': JSON.stringify({ type: 'GQL_START', payload: { query: '{ test }' } }),
        'json': JSON.stringify({ event: 'ping' }),
        'default': `Hello from client (${name})`
      };
      const toSend = payloads[ws.protocol] || payloads.default;
      ws.send(toSend);
    });

    ws.once('message', (message) => {
      receivedMessage = true;
      const text = message.toString();
      try {
        const parsed = JSON.parse(text);
        console.log(`📩 Received JSON:`, parsed);
      } catch {
        console.log(`📩 Received:`, text);
      }

      setTimeout(() => ws.close(1000, 'Test complete'), 200);
    });

ws.on('close', (code, reason) => {
  const reasonStr = reason?.toString('utf-8') || '';

  if (!resultLogged) {
    if (
      code !== 1000 ||
      reasonStr.toLowerCase().includes('invalid') ||
      reasonStr.toLowerCase().includes('unsupported')
    ) {
      results.push({ name, success: false, error: `Server closed: code=${code}, reason=${reasonStr || '(none)'}` });
    } else if (!ws.protocol && protocols?.length) {
      results.push({ name, success: false, error: 'No subprotocol negotiated (unsupported)' });
    } else {
      results.push({ name, success: true, protocol: ws.protocol || '(none)' });
    }
    resultLogged = true;
  }

  console.log(`🔒 Connection closed (code=${code}, reason=${reasonStr || '(no reason)'})`);
  resolve();
});


    ws.on('error', (err) => {
      if (!resultLogged) {
        results.push({ name, success: false, error: `Handshake failed: ${err.message}` });
        resultLogged = true;
      }
      resolve();
    });
  });
}

async function runTests() {
  const apiWsUrl = 'ws://<gw-host>:<gw-ws-port>/<context>/<version>/';

  await testConnection('Single-valid', apiWsUrl, ['json']);
  await testConnection('All-supported', apiWsUrl, ['graphql-ws', 'graphql-transport-ws', 'json']);
  await testConnection('Multiple-with-supported', apiWsUrl, ['foo', 'graphql-transport-ws', 'bar','json']);
  await testConnection('All-unsupported', apiWsUrl, ['foo', 'bar']);
  await testConnection('No-protocol', apiWsUrl, null);
  await testConnection('Custom-content-type', apiWsUrl, ['charith']);
  await testConnection('Custom-proto-sanitized', apiWsUrl, ['testValue']);

  console.log('\n📊 Test Summary:');
  for (const r of results) {
    if (r.success) {
      console.log(`✅ ${r.name}: subprotocol = ${r.protocol}`);
    } else {
      console.log(`❌ ${r.name}: ${r.error}`);
    }
  }
}

runTests();
