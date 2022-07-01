const { createConnection } = require('mysql2')

let connection = createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'chatDB'
})

const query = async (q) => {
  return new Promise((resolve, reject) => {
    connection.query(q, (err, results, fields) => {
      if (err) {
        return reject(err)
      }
      resolve(results)
    })
  })
}

module.exports = {
  connection,
  query
}