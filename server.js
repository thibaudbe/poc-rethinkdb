const fs = require('fs')
const http = require('http')
const path = require('path')
const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const socketIO = require('socket.io')
require('dotenv').config()

const publicPath = path.join(__dirname, 'public')

const app = express()
const server = http.Server(app)
const io = socketIO(server)

app.use(logger('dev'))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())
app.use(express.static(publicPath, { maxAge: 31557600000 }))

require('./lib/socket')(io)
const connectDb = require('./lib/connect')
const users = require('./routes/users')

app.use(connectDb.connect)
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: publicPath })
})
app.use('/api', users)
app.use(connectDb.close)

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.json({
    error: err.message
  })
})

app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  res.json(err)
})

server.listen(3333, () => {
  const host = server.address().address
  const port = server.address().port
  console.log(`App is listening on http://${host}:${port}`)
})
