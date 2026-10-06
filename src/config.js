import { flush } from "./flush.js";
export let dbFunction = null;
export let BatchSize = 20;
let Interval = 10000;

export const TraceFlowInit = ({ method, BatchSizeValue = 20, IntervalValue = 10000 }) => {
    dbFunction = method;
    Interval = IntervalValue;
    BatchSize = BatchSizeValue;
    setInterval(() => {
        flush();
    }, Interval);
}


export const pushLogs = async (logs) => {
    if (dbFunction) {

        try {
            await dbFunction(logs);
        } catch (err) {
            throw err;
        }
    }
}