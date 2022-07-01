
const express = require('express')
const path = require('path')

const app = express()

const userRouter = require('./routers/user')
const roomRouter = require('./routers/room')
const chatRouter = require('./routers/chat')

const publicDirPath = path.join(__dirname, '../public')

app.use(express.json())
app.use(express.static(publicDirPath))
app.use(userRouter)
app.use(roomRouter)
app.use(chatRouter)

module.exports = app