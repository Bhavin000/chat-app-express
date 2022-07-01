const { Router } = require('express')
const { isEmail } = require("validator");
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path');

const { query } = require('../db/mysql')
const auth = require('../middleware/auth')
const { User } = require('../models/user');

const router = new Router()

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    if (!isEmail(user.email)) {
      throw new Error()
    }
    user.password = await user.hashPassword()
    const q = `INSERT INTO 
                  users (name, email, password) 
                  VALUES ('${user.name}', '${user.email}', '${user.password}')`

    const results = await query(q)
    res.status(201).send(results)
  } catch (error) {
    res.status(400).send({ error: error.sqlMessage })
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!isEmail(email)) {
      throw new Error()
    }
    const q = `SELECT * FROM users 
                  WHERE email='${email}'`

    const results = await query(q)
    if (results.length !== 1) {
      throw new Error()
    }
    const user = new User(results[0])
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error()
    }

    const token = await user.generateAuthToken()


    res.send({
      user: user.toJSON(),
      token
    })

  } catch (error) {
    return res.status(400).send({ error: 'Unable to login' })
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    const q = `DELETE FROM tokens 
                    WHERE user_id=${req.user._id}
                      AND token='${req.token}'`

    const results = await query(q)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    const q = `DELETE FROM tokens 
                    WHERE user_id=${req.user._id}`

    const results = await query(q)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

router.get('/users/me', auth, (req, res) => {
  res.send(req.user.toJSON())
})

router.delete("/users/me", auth, async (req, res) => {
  try {
    const q = `DELETE FROM users WHERE id=${req.user._id}`
    const results = await query(q)

    res.send(req.user.toJSON())
  } catch (error) {
    res.sendStatus(500)
  }
});

const avatar = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png)$/)) {
      return cb(new Error('Please upload a image'))
    }
    cb(undefined, true)
  }
})

router.post('/users/me/avatar', auth, avatar.single('avatar'), (req, res) => {
  try {
    const buffer = sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toFile(`public/avatars/${req.user._id}.png`,
        (err, info) => {
          if (err) {
            return res.sendStatus(400)
          }
          res.send()
        })
  } catch (error) {
    res.status(400).send({ error: error })
  }
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    await fs.promises.unlink(`public/avatars/${req.user._id}.png`)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(400)
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const buffer = await fs.promises.readFile(`public/avatars/${req.params.id}.png`)
    res.set('Content-Type', 'image/png')
    res.send(buffer)
  } catch (error) {
    res.sendStatus(404)
  }
})


module.exports = router