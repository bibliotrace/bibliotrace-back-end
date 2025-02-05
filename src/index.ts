import express from "express"
import cors from 'cors'
import Config from "./config"
import { expressjwt, ExpressJwtRequest } from "express-jwt";


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

server.use(express.json())

server.use(expressjwt({
  secret: process.env.AUTH_KEY,
  algorithms: ["HS256"],
  onExpired: async (req, err) => {
    console.log('EXPIREDDDD')
    throw err
  }
}).unless({ path: ["/login"] }))

server.get("/search/:searchQuery", async (req, res) => { 
  try {
    console.log('Handling call to /search with query ' + req.params.searchQuery )
    console.log(`Query Auth: ${await JSON.stringify(req.auth)}`)
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
    console.log(`Query Auth: ${req.auth}`)
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

server.post('/login', async (req, res) => {
  console.log(req.body)
  if (req.body.username != null && req.body.password != null) {
    const token = await depsObject.userAuthService.login(req.body.username, req.body.password)

    res.send({ message: 'success', token })
  } else {
    res.status(400).send({ message: 'Missing Username or Password in request body' })
  }

})

server.get("/dummy", (req, res) => {
  res.json({ message: "json testing" });
});

console.log(`Server Listening on Port ${localPort}`);
server.listen(localPort);
