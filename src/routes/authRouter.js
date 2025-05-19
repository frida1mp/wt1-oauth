/**
 * @file Defines the issue router.
 * @module routes/issueRouter
 * @author Frida Pedersén
 * @version 3.0.0
 */

import express from 'express'
import { AuthController } from '../controllers/authController.js'

export const router = express.Router()

const controller = new AuthController()

router.get('/', controller.login)
router.get('/callback', controller.callback.bind(controller))

router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})
