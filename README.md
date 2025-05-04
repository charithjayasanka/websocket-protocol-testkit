# 🔌 WebSocket Subprotocol Negotiation Playground

This project demonstrates comprehensive testing of **WebSocket subprotocol negotiation** in two distinct environments:

- **`client-gw.js`** – Simulates WebSocket traffic routed **through WSO2 API Manager Gateway**, enabling validation of subprotocol handling by the API Gateway layer.
- **`client-direct.js`** – Establishes a direct connection to the **backend WebSocket server**, bypassing any intermediary gateway components, for pure backend behavior analysis.

## 🧠 Objective

To validate and compare how different WebSocket subprotocols are negotiated under gateway vs. direct conditions, particularly to:

- Confirm that subprotocols are correctly negotiated and forwarded by the API Gateway.
- Evaluate compatibility and behavior across custom and standard subprotocols.
- Diagnose handshake failures when unsupported or mismatched subprotocols are used.

## 🔌 Supported Subprotocols

The backend WebSocket server is configured to accept the following subprotocols:

- `graphql-ws`
- `graphql-transport-ws`
- `json`
- `custom-proto-1`
- `charith`
- `testValue`

These subprotocols are validated using the `handleProtocols` function during the initial WebSocket handshake.

## 🚀 How It Works

Each client sends a list of subprotocols during the WebSocket handshake via the `Sec-WebSocket-Protocol` header. The server selects the first match from its supported list. If no match is found, the connection is either established without a subprotocol (if allowed) or closed immediately.

## 🧪 Test Coverage

The following scenarios are tested via both clients:

| Test Case                 | Description                                                  | Expected Result                    |
|--------------------------|--------------------------------------------------------------|------------------------------------|
| `Single-valid`           | Send one supported protocol (`json`)                         | Negotiated as `json`               |
| `All-supported`          | Send all supported protocols                                  | Negotiated as `graphql-ws` (first match) |
| `Multiple-with-supported`| Mix supported and unsupported protocols                      | Negotiated as first valid match    |
| `All-unsupported`        | Send only unsupported protocols                               | Handshake failure                  |
| `No-protocol`            | No subprotocols sent                                         | Server rejects the connection      |
| `Custom-content-type`    | Send `charith` as protocol                                   | Negotiated as `charith`            |
| `Custom-proto-sanitized` | Send `testValue`                                             | Negotiated as `testValue`          |

## 📥 Server Logs (Excerpt)

```
📥 handleProtocols called with: [ 'json' ]
🔍 Looking for match in: [ 'graphql-ws', 'graphql-transport-ws', 'json', ... ]
✅ Match found: "json"
[xt6zdg] 🔗 New connection from ::ffff:127.0.0.1
[xt6zdg] Raw Sec-WebSocket-Protocol header: json
[xt6zdg] Negotiated subprotocol: json
📩 Received: {"event":"ping"}
🔒 Connection closed (code=1000, reason=Test complete)

📥 handleProtocols called with: [ 'foo', 'bar' ]
🔍 No supported subprotocol found
[f1jc9l] Negotiated subprotocol: (none)
❌ Unsupported or missing subprotocol. Closing connection.
```

## 📤 Client Output Comparison

### `client-direct.js` (Direct Backend Connection)

```
--- Test: Single-valid ---
📦 Requested: [ 'json' ]
🔄 Negotiated: json

--- Test: All-supported ---
📦 Requested: [ 'graphql-ws', 'graphql-transport-ws', 'json' ]
🔄 Negotiated: graphql-ws

--- Test: All-unsupported ---
📦 Requested: [ 'foo', 'bar' ]
❌ Handshake failed: Server sent no subprotocol

--- Test: No-protocol ---
📦 Requested: (none)
❌ Server closed: Unsupported or missing subprotocol
```

### `client-gw.js` (Through API Gateway)

_Example output may vary depending on gateway behavior and headers forwarded. Logs are compared to `client-direct` to validate consistency._

## 📁 Project Structure

```
.
├── server.js            # WebSocket server with subprotocol support
├── client-direct.js     # Client connecting directly to backend
├── client-gw.js         # Client connecting through API Gateway
├── README.md            # Documentation
```

## 🧩 Usage

Start the server:

```bash
node server.js
```

Test using direct client:

```bash
node client-direct.js
```

Test using API Gateway-routed client:

```bash
node client-gw.js
```

## 📌 Notes

- Ensure the WSO2 API Manager WebSocket passthrough configuration allows forwarding the `Sec-WebSocket-Protocol` header.
- Useful for validating behavior in production environments where WebSocket security, inspection, or transformation policies are in effect.

---

© 2025 Charith — Advanced WebSocket Testing