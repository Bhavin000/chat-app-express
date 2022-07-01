const jwt = require('jsonwebtoken')
const { query } = require('../db/mysql')
const { User } = require('../models/user')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, 'thisisit')

    const q = `SELECT id, name, email, password FROM users 
                    JOIN tokens 
                    ON users.id=tokens.user_id 
                    WHERE 
                      users.id=${decoded._id} 
                      AND tokens.token='${token}'
                    GROUP BY users.id`

    const results = await query(q)
    if (results.length === 0) {
      throw new Error()
    }

    req.token = token
    req.user = new User(results[0])
    next()
  } catch (error) {
    res.status(401).send({ error: "please authenticate" });
  }
}

module.exports = auth