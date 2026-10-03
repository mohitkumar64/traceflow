
import {traceStorage} from "./index.js";

export async function traced(name, fn) {
 const context = traceStorage.getStore();
 const span = {
  name,
  startedAt: performance.now(),
  endedAt: null,
  duration: null,
  error : false
 }
 const temp = await fn();
 span.endedAt = performance.now();
 span.duration = span.endedAt - span.startedAt;
 context.spans.push(span);
 return temp;
}