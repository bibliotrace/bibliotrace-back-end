import express from "express";
import Deps from "./deps"


const server = express();
const localPort = 8080;
const deps = new Deps()
let depsObject

deps.setup()
  .then((result) => {
    depsObject = result
  })


server.get("/basicSearch/:searchQuery", async (req, res) => { 
  try {
    const results = await deps.dependencies.searchRouteHandler.conductSearch(req.params.searchQuery)
    res.send(results);
  } catch (e) {
    console.log(e)
    res.code(500).send(e)
  }
  
  
});

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
