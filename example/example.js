// import { traceflow, traced } from "traceflow";
// import express from "express";
// const app = express();

// app.use(traceflow());

// app.get("/", async (req, res) => {

//   const user = await traced("Fetch User", async () => {
//     return users.findOne({ name: "John" });
//   });

//   res.json(user);
// });