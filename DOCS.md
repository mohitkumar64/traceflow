# Traceflow Documentation

## Table of Contents

- [API Reference](#api-reference)
  - [traceflow](#traceflow)
  - [traced(name, fn)](#tracedname-fn)
  - [TraceFlowInit(options)](#traceflowintoptions)
  - [pushLogs(logs)](#pushlogslogs)
  - [Batch](#batch)
  - [showBatch()](#showbatch)
- [Configuration](#configuration)
- [Nested Operations](#nested-operations)
- [Flush Behavior](#flush-behavior)
- [Full Example with Database Persistence](#full-example-with-database-persistence)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Design Goals](#design-goals)
- [Development](#development)

---

## API Reference

### `traceflow`

Express middleware that creates a trace context for each incoming request. Each request gets its own isolated context using `AsyncLocalStorage`.

```js
import { traceflow } from "@productionbisect/traceflow";

app.use(traceflow);
```

The middleware:
- Generates a unique `traceId` (UUID) per request
- Records the HTTP method, URL, and start time
- Collects all spans created via `traced()` during the request
- On response finish, pushes the trace into the batch buffer
- Triggers a flush if the batch reaches `BatchSize`

### `traced(name, fn)`

Wraps an async operation and records its timing as a span.

```js
import { traced } from "@productionbisect/traceflow";

const user = await traced("Fetch User", async () => {
  return getUser();
});
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Name identifying the operation |
| `fn` | `Function` | Async function to execute and measure |

#### Returns

Returns the result of `fn`. If `fn` throws, the error is re-thrown after recording the span with `error: true`.

#### Span Object

Each call to `traced()` creates a span:

```js
{
  name: "Fetch User",
  startedAt: 1234.56,      // performance.now()
  endedAt: 1267.89,        // performance.now()
  duration: "33 ms",
  error: false
}
```

### `TraceFlowInit(options)`

Initializes the trace persistence system. Call this once at application startup.

```js
import { TraceFlowInit } from "@productionbisect/traceflow";

TraceFlowInit({
  method: async (logs) => {
    await db.collection("traces").insertMany(logs);
  },
  BatchSizeValue: 20,
  IntervalValue: 10000,
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `Function` | `null` | Async function that receives an array of trace logs and persists them (e.g., to a database) |
| `BatchSizeValue` | `number` | `20` | Number of traces to collect before triggering a flush |
| `IntervalValue` | `number` | `10000` | Interval in milliseconds for the automatic flush timer |

### `pushLogs(logs)`

Low-level function that calls the `method` you provided in `TraceFlowInit`. Used internally by `flush()`, but exported if you need to push logs manually.

```js
import { pushLogs } from "@productionbisect/traceflow";

await pushLogs(myLogs);
```

### `Batch`

The in-memory array where traces are buffered before flushing.

```js
import { Batch } from "@productionbisect/traceflow";

console.log(Batch.length); // number of pending traces
```

### `showBatch()`

Returns the current batch array.

```js
import { showBatch } from "@productionbisect/traceflow";

console.log(showBatch());
```

---

## Configuration

All configuration is done through `TraceFlowInit()`:

```js
TraceFlowInit({
  // Required: function to persist traces
  method: async (logs) => {
    await db.collection("traces").insertMany(logs);
  },

  // Optional: flush when batch reaches this size (default: 20)
  BatchSizeValue: 50,

  // Optional: auto-flush interval in ms (default: 10000 = 10s)
  IntervalValue: 30000,
});
```

If `method` is not set, traces are collected in memory but never persisted. A warning is logged on each flush attempt.

---

## Nested Operations

Operations can be traced inside other traced operations:

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

This produces spans that represent a hierarchy:

```
Checkout
├── Fetch User
└── Payment
```

---

## Flush Behavior

Traces are flushed to your database function in two ways:

1. **Batch size threshold** — When the number of collected traces reaches `BatchSize`, a flush is triggered immediately.
2. **Timer interval** — Every `IntervalValue` milliseconds, a flush runs regardless of batch size.

Flushing is guarded against concurrent execution — if a flush is already in progress, subsequent triggers are skipped.

---

## Full Example with Database Persistence

```js
import express from "express";
import { MongoClient } from "mongodb";
import { traceflow, traced, TraceFlowInit } from "@productionbisect/traceflow";

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("myapp");

// Initialize traceflow with MongoDB persistence
TraceFlowInit({
  method: async (logs) => {
    await db.collection("traces").insertMany(logs);
  },
  BatchSizeValue: 10,
  IntervalValue: 5000,
});

const app = express();

app.use(traceflow);

app.get("/users/:id", async (req, res) => {
  const user = await traced("Fetch User", async () => {
    return db.collection("users").findOne({ _id: req.params.id });
  });

  const orders = await traced("Fetch Orders", async () => {
    return db.collection("orders").find({ userId: req.params.id }).toArray();
  });

  res.json({ user, orders });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
```

---

## Project Structure

```
traceflow/
│
├── src/
│   ├── index.js         # Main entry — exports & traceStorage
│   ├── middleware.js     # Express middleware
│   ├── traced.js         # traced() function
│   ├── config.js         # TraceFlowInit, pushLogs, settings
│   ├── batch.js          # In-memory batch buffer
│   └── flush.js          # Flush logic
│
├── example/
│   └── example.js
│
├── images/               # Benchmark screenshots
├── .github/workflows/    # CI/CD
├── package.json
├── README.md
└── DOCS.md
```

---

## Roadmap

### Current (V0.2)

- ✅ Express middleware
- ✅ Request-level trace context via `AsyncLocalStorage`
- ✅ `traced()` API with timing
- ✅ Error tracking in spans
- ✅ Batch collection & auto-flush
- ✅ Configurable database persistence

### V1

- Nested span relationships (parent/child span IDs)
- Concurrent span handling
- Test suite
- Performance benchmarks
- Stable API

### V2

- Automatic trace batching with background workers
- Retry & backpressure handling
- Trace querying & inspection
- Database instrumentation

### Future

- Automatic async instrumentation (ESM loaders / source transformation)
- Trace visualization
- Runtime integrations

```
V0.1 → V1 → V2 → Future
 │      │     │      │
 │      │     │      ├── Auto instrumentation
 │      │     │      └── Trace visualization
 │      │     ├── Background workers
 │      │     ├── Trace querying
 │      │     └── DB instrumentation
 │      ├── Nested spans
 │      ├── Tests
 │      └── Stable API
 ├── Express middleware
 ├── AsyncLocalStorage
 ├── traced()
 ├── Batching & flush
 └── DB persistence
```

---

## Design Goals

### Minimal Instrumentation

Tracing should require as little code change as possible:

```js
await traced("operation", async () => {
  // existing application code
});
```

### Low Overhead

Observability should not become a significant source of latency. Benchmarks show **~1ms** average response time overhead.

### Node.js First

Built specifically around Node.js capabilities:
- `AsyncLocalStorage` for context propagation
- `performance.now()` for high-resolution timing
- ESM modules

---

## Development

Clone and run locally:

```bash
git clone https://github.com/mohitkumar64/traceflow.git
cd traceflow
npm install
node example/example.js
```

---

## Requirements

- Node.js >= 24.0.0
- Express (peer dependency)
