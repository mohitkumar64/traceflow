# Traceflow

> Lightweight async execution tracing for Node.js — adds only **~1ms** to average response time.

## Performance Impact

Benchmarked with **20 virtual users** over **2 minutes** on the same query:

| Metric | Without Traceflow | With Traceflow | Difference |
|--------|-------------------|----------------|------------|
| **Avg Response Time** | **14 ms** | **15 ms** | **+1 ms** |
| Requests/sec | 658.12 | 659.60 | +1.48 |
| Total Requests | 30,580 | 30,560 | -20 |
| P90 | 37 ms | 39 ms | +2 ms |
| P95 | 55 ms | 58 ms | +3 ms |
| P99 | 81 ms | 87 ms | +6 ms |
| Error % | 0.00 | 0.00 | 0 |
| Peak CPU % | 53.9% | 55.7% | +1.8% |
| Peak Memory % | 69.9% | 70.0% | +0.1% |

**Without Traceflow:**

![Without Traceflow benchmark](images/without%20TraceFlow.png)

**With Traceflow:**

![With Traceflow benchmark](images/with%20Traceflow.png)

---

## What is Traceflow?

Traceflow tells you where time is actually spent inside your async Node.js code.

Instead of just seeing:

```
GET /checkout — 582ms
```

You get:

```
GET /checkout
├── Fetch User — 143ms
│   └── Database Query — 120ms
└── Payment — 421ms
    └── Payment API — 390ms
```

---

## Installation

```bash
npm install @productionbisect/traceflow
```

---

## Quick Start

```js
import express from "express";
import { traceflow, traced } from "@productionbisect/traceflow";

const app = express();

app.use(traceflow);

app.get("/checkout", async (req, res) => {
  const user = await traced("Fetch User", async () => {
    return getUser();
  });

  const payment = await traced("Payment", async () => {
    return processPayment();
  });

  res.json({ user, payment });
});

app.listen(8000);
```

That's it. `traceflow` is an Express middleware. `traced()` wraps any async operation you want to measure.

---

## Project Status

Traceflow is in early development (`v0.2.0`). The API is experimental and may change.

---

## Full Documentation

See [DOCS.md](DOCS.md) for the complete API reference, configuration options, project structure, and roadmap.

---

## Contributing

Contributions, ideas, and bug reports are welcome. Open an issue or pull request.

---

## License

MIT