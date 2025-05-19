/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-returns */
import axios from 'axios'
import { authService } from '../services/authService.js'
import dotenv from 'dotenv'
dotenv.config()

/* eslint-disable camelcase */
/**
 * @file Defines the AuthController class.
 * @module controllers/AuthController
 * @author Frida Pedersén
 * @version 3.3.0
 */
export class AuthController {
  // eslint-disable-next-line jsdoc/require-description
  /**
   *
   * @param {object} req -
   * @param {object} res -
   */
  login (req, res) {
    const authorizationUrl = `${process.env.GITLAB_BASE_URL}/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=api`

    res.redirect(authorizationUrl)
  }

  // eslint-disable-next-line jsdoc/require-returns
  /**
   * Displays a list of all tasks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async callback (req, res, next) {
    try {
      const { code } = req.query

      if (!code) throw new Error('Authorization code is missing.')

      const tokenData = await authService.getAccessToken(code)

      if (!req.session) {
        console.error('Session is not initialized!')
        return res.status(500).send('Session not initialized')
      }

      req.session.accessToken = tokenData.accessToken

      console.log('redirecting')
      res.redirect('/user')
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *
   * @param req
   * @param res
   */
  async logout (req, res) {
    try {
      if (req.session.accessToken) {
        const response = await authService.logoutUser(req, res)
        console.log('response', response.status)

        if (response.status === 200) {
          res.redirect('../')
        }
      }
    } catch (error) {
      console.error('Logout error:', error.message)
    }
  }
}
