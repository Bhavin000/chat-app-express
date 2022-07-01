const { Router } = require('express')

const { query } = require('../db/mysql')
const auth = require('../middleware/auth')

const router = new Router()

router.get('/rooms', auth, async (req, res) => {
  try {
    const q = `SELECT * FROM rooms`
    const results = await query(q)
    res.send(results)
  } catch (error) {
    res.sendStatus(400)
  }
})

router.get('/rooms/me', auth, async (req, res) => {
  try {
    const q = `SELECT id, name FROM rooms 
                JOIN room_user_rel 
                  ON rooms.id=room_user_rel.room_id 
                WHERE user_id=${req.user._id}`
    const results = await query(q)
    res.send(results)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/rooms', auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      throw new Error()
    }
    const q1 = `INSERT INTO rooms (name, created_by) 
                VALUES ('${name}', ${req.user._id})`
    const results = await query(q1)

    const q2 = `INSERT INTO room_user_rel (user_id, room_id)
                VALUES (${req.user._id}, ${results.insertId})`
    await query(q2)
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/rooms/join', auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) {
      throw new Error()
    }
    const q1 = `SELECT id FROM rooms WHERE name='${name}'`
    const results = await query(q1)

    const q2 = `INSERT INTO room_user_rel (user_id, room_id)
                VALUES (${req.user._id}, ${results[0].id})`
    await query(q2)
    res.sendStatus(200)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.post('/rooms/me/leave', auth, async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      throw new Error()
    }
    console.log(id);
    const q = `DELETE FROM room_user_rel 
                WHERE user_id=${req.user._id} 
                  AND room_id=${id}`

    const results = await query(q)
    res.sendStatus(200)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/rooms/me', auth, async (req, res) => {
  try {
    const q = `DELETE FROM rooms 
              WHERE created_by=${req.user._id} 
              AND id=${req.body.id}`
    await query(q)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(400)
  }
})

module.exports = router
