const { Router } = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const path = require('path');

const { query } = require('../db/mysql')
const auth = require('../middleware/auth')

const router = new Router()

router.post('/chats/text', auth, async (req, res) => {
  try {
    const { room_id, chat } = req.body

    const q1 = `SELECT * FROM room_user_rel 
                WHERE user_id=${req.user._id} 
                  AND room_id=${room_id}`
    const results = await query(q1)
    if (!results || results.length === 0) {
      throw new Error('Not in the room')
    }

    const q2 = `INSERT INTO chats (user_id, room_id, chat, file)
              VALUES (${req.user._id}, ${room_id}, '${chat}', 'TEXT')`
    await query(q2)
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
})

const file = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png)$/)) {
      return cb(new Error('Please upload a image'))
    }
    cb(undefined, true)
  }
})

router.post('/chats/img', auth, file.single('file'), async (req, res) => {
  try {
    const { room_id } = req.body
    if (!req.file) {
      throw new Error('please upload img')
    }

    const q1 = `SELECT * FROM room_user_rel 
                WHERE user_id=${req.user._id} 
                  AND room_id=${room_id}`
    const results = await query(q1)
    if (!results || results.length === 0) {
      throw new Error('Not in the room')
    }

    const fileNameUuid = uuid().toString()
    sharp(req.file.buffer)
      .png()
      .toFile(`public/files/${fileNameUuid}.png`,
        (err, info) => {
          if (err) {
            return res.sendStatus(400)
          }
        })

    const q2 = `INSERT INTO chats (user_id, room_id, chat, file)
              VALUES (${req.user._id}, ${room_id}, 'IMG', '${fileNameUuid}')`
    await query(q2)
    res.sendStatus(201)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/chats/me', auth, async (req, res) => {
  try {
    const { room_id } = req.body

    const q1 = `SELECT * FROM room_user_rel 
                WHERE user_id=${req.user._id} 
                  AND room_id=${room_id}`
    const result = await query(q1)
    if (!result || result.length === 0) {
      throw new Error('Not in the room')
    }

    const q = `SELECT user_id, chat, file,created_at FROM chats
              WHERE room_id=${room_id}`
    const results = await query(q)
    res.send(results)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/chats/img', auth, async (req, res) => {
  try {
    const { room_id, img_id } = req.body

    const q1 = `SELECT * FROM room_user_rel 
                WHERE user_id=${req.user._id} 
                  AND room_id=${room_id}`
    const result = await query(q1)
    if (!result || result.length === 0) {
      throw new Error('Not in the room')
    }

    const q = `SELECT * FROM chats 
              WHERE room_id=${room_id}`
    const results = await query(q)
    if (!results || result.length === 0) {
      throw new Error()
    }

    const buffer = await fs.promises.readFile(`public/files/${img_id}.png`)
    res.set('Content-Type', 'image/png')
    res.send(buffer)
  } catch (error) {
    res.status(400).send(error)
  }
})


module.exports = router