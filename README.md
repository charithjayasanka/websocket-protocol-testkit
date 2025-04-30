# 🔌 WebSocket Subprotocol Negotiation Playground

A fully working Node.js-based WebSocket server and test client to explore, validate, and debug WebSocket subprotocol negotiation — including support for `graphql-ws`, `json`, and WSO2-style `synapse-contentType-*` formats.

---

## 🚀 Features

- ✅ Subprotocol negotiation using `handleProtocols`
- ✅ Supports multiple protocols: `graphql-ws`, `graphql-transport-ws`, `json`, etc.
- ✅ Echo server that returns received messages
- ✅ Includes advanced test cases with:
  - Multiple protocol offers
  - Unsupported protocols
  - Custom `synapse-contentType-*` tokens
  - No protocol scenario
- ✅ Logs everything: headers, negotiated protocol, connection lifecycle

---

## 🧠 Use Cases

- 🔎 Debugging WebSocket protocol negotiation in browser or Node.js clients
- 🧪 Validating WebSocket behavior through WSO2 API Manager (APIM) Gateway
- 🧬 Simulating real-world GraphQL/WebSocket integrations
- 🛠️ Testing custom subprotocol formats like `synapse-contentType-application-json`

---

## 📦 Installation

```bash
git clone https://github.com/charithjayasanka/websocket-protocol-testkit.git
cd websocket-protocol-testkit
npm install
```

---

## ▶️ Usage

### 1. Start the WebSocket echo server

```bash
node server.js
```

You’ll see:

```
✅ WebSocket echo server listening on ws://localhost:8080
```

### 2. Run the test client

```bash
node client.js
```

Sample output:

```
--- Test: Single-valid ---
🌐 Connecting to ws://localhost:8080/echo
📦 Requested subprotocols: [ 'json' ]
✅ Connection open
🔄 Negotiated subprotocol: json
📩 Received JSON: ...
```

---

## 🧪 Test Cases Covered

| Test Name               | Protocols Sent                         | Expected Behavior                     |
|------------------------|----------------------------------------|----------------------------------------|
| Single-valid           | `[ 'json' ]`                           | Negotiates `json`                     |
| Multiple-with-supported| `[ 'foo', 'graphql-transport-ws' ]`    | Picks supported: `graphql-transport-ws`|
| All-unsupported        | `[ 'foo', 'bar' ]`                     | No subprotocol negotiated             |
| No-protocol            | `null`                                 | Connects without subprotocol          |
| Custom-content-type    | `[ 'synapse-contentType-application-json' ]` | Negotiates custom protocol      |
| Custom-proto-sanitized| `[ 'synapse-contentType_application_json' ]` | Negotiates custom protocol     |

---

## 🔍 Sample Server Log

```text
📥 handleProtocols called with: [ 'json' ]
🔍 Checking if supported: "json"
✅ Match found: "json"
Negotiated subprotocol: json
📩 Received: {"event":"ping"}
```

---

## 🧱 Project Structure

```
.
├── client.js   # Test client with all scenarios
├── server.js   # Echo WebSocket server with subprotocol handling
├── package.json
└── README.md
```

---

## 🔧 Customize Supported Protocols

In `server.js`:

```js
const SUPPORTED_PROTOCOLS = new Set([
  'json',
  'graphql-ws',
  'graphql-transport-ws',
  'synapse-contentType-application-json',
  'synapse-contentType_application_json'
]);
```

Add or remove from the list to suit your environment.

---

## 📎 License

MIT License

---
