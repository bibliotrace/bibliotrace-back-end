// Hello World!

import express from 'express'

const server = express()
const localPort = 8080

server.get('/', (req, res) => {
    res.send('Hello!')
})

console.log(`Server Listening on Port ${localPort}`)
server.listen(localPort)


