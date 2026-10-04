# Traceflow

> Lightweight async execution tracing for Node.js applications.

Traceflow is a Node.js tracing library for understanding where time is spent inside asynchronous application code.

Instead of only seeing:

```text
GET /checkout — 582ms
```

Traceflow is designed to provide structured execution information such as:

```text
GET /checkout
├── Fetch User — 143ms
│   └── Database Query — 120ms
└── Payment — 421ms
    └── Payment API — 390ms
```

## 🚧 Project Status

Traceflow is currently in early development (`v0.1.0`).

The current version focuses on the core tracing API and request-level async context.

The API is experimental and may change before the first stable release.

---

## Installation

```bash
npm install traceflow
```

---

## Example

Trace an Express application with minimal instrumentation:

```js
import express from "express";
import { traceflow, traced } from "@bisect/traceflow";

const app = express();

app.use(traceflow());

app.get("/checkout", async (req, res) => {
  const user = await traced("Fetch User", async () => {
    return getUser();
  });

  const payment = await traced("Payment", async () => {
    return processPayment();
  });

  res.json({
    user,
    payment
  });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
```

### Nested Operations

Operations can also be traced inside other operations:

```js
await traced("Checkout", async () => {
  await traced("Fetch User", async () => {
    await getUser();
  });

  await traced("Payment", async () => {
    await processPayment();
  });
});
```

This allows operations to be represented as a hierarchy:

```text
Checkout
├── Fetch User
└── Payment
```

---

## API

### `traceflow()`

Adds Traceflow to an Express application.

```js
app.use(traceflow());
```

A separate trace context is created for each incoming request.

### `traced(name, fn)`

Traces an asynchronous operation.

```js
const user = await traced("Fetch User", async () => {
  return getUser();
});
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Name of the operation |
| `fn` | `Function` | Function containing the operation |

#### Returns

`traced()` returns the result of the supplied function.

```js
const result = await traced("Database Query", async () => {
  return queryDatabase();
});
```

---

## Current V1

The current version focuses on establishing the core tracing model.

### Included

- Express middleware
- Request-level trace context
- `AsyncLocalStorage` based context propagation
- `traced()` API
- Operation timing
- Async context isolation between requests
- Basic trace/span collection

### In Progress

- Nested span relationships
- Parent/child span IDs
- Error tracking
- Concurrent span handling
- Test suite
- Performance benchmarks
- Stable API

---

## V2 Roadmap

The next major version will focus on turning Traceflow from a lightweight tracing primitive into a more complete observability system.

### Automatic Trace Batching

Instead of persisting trace data directly during a request, Traceflow will collect traces and process them asynchronously.

```text
Request
   │
   ▼
Trace
   │
   ▼
Buffer
   │
   ▼
Batch
   │
   ▼
Background Worker
   │
   ▼
Storage
```

The goal is to keep trace persistence outside the critical request path.

### Background Processing

Trace processing and persistence will be handled by background workers to reduce the overhead added to application requests.

Planned capabilities include:

- Trace buffering
- Batch processing
- Background workers
- Retry handling
- Backpressure handling
- Persistent trace storage

### Automatic Instrumentation

A longer-term goal is to reduce the amount of manual instrumentation required.

Currently:

```js
await traced("Database Query", async () => {
  return users.findOne(...);
});
```

The project will explore ways to automatically instrument asynchronous operations such as:

```js
await users.findOne(...);
```

Potential approaches include Node.js ESM loaders and source transformation.

This will be explored carefully to preserve JavaScript execution semantics and minimize runtime overhead.

### Trace Querying

Future versions will provide ways to inspect stored traces and investigate slow requests and expensive operations.

---

## Roadmap

```text
V0.1
 │
 ├── Request context
 ├── AsyncLocalStorage
 ├── traced()
 └── Basic tracing
       │
       ▼
V1
 │
 ├── Nested spans
 ├── Error tracking
 ├── Concurrent operations
 ├── Tests
 └── Benchmarks
       │
       ▼
V2
 │
 ├── Automatic batching
 ├── Background workers
 ├── Persistent storage
 ├── Trace querying
 └── Database instrumentation
       │
       ▼
Future
 │
 ├── Automatic async instrumentation
 ├── ESM transformation
 ├── Runtime integrations
 └── Trace visualization
```

---

## Design Goals

### Minimal Instrumentation

Tracing should require as little application code as possible.

```js
await traced("operation", async () => {
  // existing application code
});
```

### Low Overhead

Observability should not become a significant source of application latency.

Trace persistence and processing are therefore planned to happen outside the request's critical path.

### Node.js First

Traceflow is designed specifically around Node.js runtime capabilities, including:

- `AsyncLocalStorage`
- `diagnostics_channel`
- asynchronous execution context
- ESM instrumentation
- source transformation

---

## Project Structure

```text
traceflow/
│
├── src/
│   ├── index.js
│   ├── middleware.js
│   └── traced.js
│
├── example/
│   └── example.js
│
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```

---

## Development

Clone the repository:

```bash
git clone https://github.com/mohitkumar64/traceflow.git
cd traceflow
```

Install dependencies:

```bash
npm install
```

Run the example:

```bash
node example/example.js
```

---

## Contributing

Traceflow is currently experimental and actively evolving.

Contributions, ideas, experiments, and bug reports are welcome.

If you're interested in Node.js internals, asynchronous execution, observability, or developer tooling, feel free to open an issue or pull request.

---

## License

MIT