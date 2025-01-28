// Hello World!

import express from "express";
import MySQLDao from "./dao/MySQLDao"; // this dependency can be removed later, this is just to test the connection

const server = express();
const localPort = 8080;

const dao = new MySQLDao();
(async () => {
  await dao.connect();
})();

server.get("/", (req, res) => {
  res.send("Hello!");
});

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
