const { connection } = require('./db/mysql')
const app = require('./app')

const port = process.env.PORT || 3000

connection.connect((err) => {
  if (err) {
    console.error(err)
    console.log('please connect to database...')
    connection.destroy()
    return
  }
  app.listen(port, () => {
    console.log('Server is up on port : ' + port)
  })
})