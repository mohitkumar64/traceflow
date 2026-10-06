import {traceStorage} from "./index.js";
import {Batch} from "./batch.js";
import {BatchSize} from "./config.js";
import {flush} from "./flush.js";
import crypto from "node:crypto";
export const traceflow = (req,res,next)=>{
        const context = {
             traceId: crypto.randomUUID(),
             method: req.method,
             url: req.url,
             startedAt: performance.now(),
             time: new Date().toISOString(),
             spans: []
           };
         
           traceStorage.run(context, () => {
         res.on("finish", () => {
             console.log("TRACE COMPLETE");
             Batch.push({ [context.traceId]: context });
     
             if (Batch.length >= BatchSize) {
                 flush();
             }
             console.dir(context, { depth: null });
         });
     
         next();
     });
}