import express from "express"
import cors from 'cors'
import Config from "./config"


const server = express();
const localPort = 8080;
const deps = new Config()
let depsObject

deps.setup()
  .then((result) => {
    depsObject = result
  })

if (process.env.FRONT_END_ORIGIN) {
  server.use(cors({ origin: 'http://localhost:5173' }))
} else {
  server.use(cors())
}

server.get("/search/:searchQuery", async (req, res) => { 
  try {
    const results = await deps.dependencies.searchRouteHandler.conductSearch(req.params.searchQuery)
    res.send(results);
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
  
  
});

server.get('/cover/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params
    const results = await deps.dependencies.coverImageRouteHandler.relayImage(isbn)
    res.send(results)
  } catch (error) {
    res.status(500).send(error)
  }
})

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
