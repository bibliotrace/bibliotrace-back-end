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
  server.use(cors({ origin: process.env.FRONT_END_ORIGIN })) //TODO: set this as our production front-end url when we do deployment
} else {
  server.use(cors())
}

server.get("/search/:searchQuery", async (req, res) => { 
  try {
    console.log('Handling call to /search with query ' + req.params.searchQuery )
    const results = await deps.dependencies.searchRouteHandler.conductSearch(req.params.searchQuery)
    res.send(results)
    console.log('Call to /search complete')
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }  
});

server.get('/cover/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params
    console.log('Handling call to /cover/' + isbn)
    if (isbn === 'none') {
      res.status(200).send()
    } else {
      const results = await deps.dependencies.coverImageRouteHandler.relayImage(isbn)
      res.send(results)
      console.log(`Call to /cover/${isbn} completed successfully.`)
    }
  } catch (error) {
    res.status(500).send(error)
    console.log('FAILURE: Call to /cover/:isbn failed for some reason')
  }  
})

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
