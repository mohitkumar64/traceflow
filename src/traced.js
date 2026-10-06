
import {traceStorage} from "./index.js";

export async function traced(name, fn, ...args) {
 const context = traceStorage.getStore();
 const span = {
  name,
  startedAt: performance.now(),
  endedAt: null,
  duration: null,
  error : false
 }
 try{
     const temp = await fn(...args);
     span.endedAt = performance.now();
      span.duration = Math.floor(span.endedAt - span.startedAt) + " ms";
      context.spans.push(span);
      return temp;
 }catch(err){
    span.error = true;
    span.endedAt = performance.now();
    span.duration = Math.floor(span.endedAt - span.startedAt) + " ms";
    context.spans.push(span);
    throw err;
 }

 
}