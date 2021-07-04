import express from "express";
import { data } from "./data";
export const app = express();
export const port = 9000; // default port to listen

// define a route handler for the default home page
app.get("/", (req: any, res: any) => {
  res.send("Hello world!");
});

app.get("/items", async (req, res) => {
  return res.send(data);
});

app.get("/items/:id", (req, res) => {
  const item = data.find(({ id }) => req.params.id === id);
  return res.send(item);
});

// start the Express server
export const server = app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
