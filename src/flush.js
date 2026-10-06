import { pushLogs } from "./config.js";
import { Batch } from "./batch.js";
import { dbFunction } from "./config.js";
let flushing = false;
export async function flush() {
    if (flushing || Batch.length === 0) return;
    if (!dbFunction) {
        console.log("Database function is not set to push logs");
        return;
    }

    flushing = true;

    try {
        const logs = Batch.splice(0, Batch.length);
        await pushLogs(logs);
        console.log("Logs flushed into the Database successfully.");
    } catch (err) {
        console.error("Error while flushing logs:", err);
    } finally {
        flushing = false;
    }
}