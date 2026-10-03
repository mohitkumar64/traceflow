import {traceStorage} from "./index.js";
export const traceflow = (req,res,next)=>{
     const context = {
        traceId: crypto.randomUUID(),
        startedAt: performance.now(),
        spans: []
      };
    
      traceStorage.run(context, next);
    
      res.on("finish", () => {
      const context = traceStorage.getStore();
    
      console.log("TRACE COMPLETE");
      console.dir(context, { depth: null });
    });
}