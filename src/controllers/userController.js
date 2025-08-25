/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-description */
import { userService } from '../services/userService.js'
import { paginate } from '../utils/paginate.js'

/**
 * @file Defines the AuthController class.
 * @module controllers/AuthController
 * @author Frida Pedersén
 * @version 3.3.0
 */
export class UserController {
  /**
   *
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async loadUser (req, res) {
    try {
      const accessToken = req.session.accessToken

      if (!accessToken) {
        return res.redirect('/')
      }

      const user = await userService.getUserProfile(accessToken)
      req.session.user = user
      res.render('dashboard', { session: req.session })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Failed to load profile.')
    }
  }

  /**
   *
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async profile (req, res) {
    try {
      res.render('profile/index', { session: req.session })
    } catch (error) {
      console.error(error)
      res.status(500).send('Failed to load profile.')
    }
  }

  /**
   *
   * @param {object} req -
   * @param {object} res -
   * @param {object} next -
   */
  async dashboard (req, res, next) {
    try {
      res.render('dashboard/index', { session: req.session })
    } catch (error) {
      console.error(error)
    }
  }

  /**
   *
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async activities (req, res) {
    try {
      const accessToken = req.session.accessToken
      const userId = req.session.user.id
      const fetchedActivities = await userService.getUserActivities(accessToken, userId)

      const allActivities = fetchedActivities.activities

      // Get current page from query param or default to 1
      const currentPage = parseInt(req.query.page) || 1
      const paginated = paginate(allActivities, currentPage, 25)

      res.render('activities/index', {
        session: req.session,
        activities: paginated.data,
        pagination: {
          currentPage: paginated.currentPage,
          totalPages: paginated.totalPages
        }
      })
    } catch (error) {
      console.error(error)
      res.status(500).send('Failed to load activities.')
    }
  }

  /**
   *
   * @param {object} req - The Express request object.
   * @param {object} res - The Express response object.
   */
  async projects (req, res) {
    try {
      const accessToken = req.session.accessToken

      const groupsWithProjects = await userService.getUserProjects(accessToken)

      res.render('projects/index', { session: req.session, Projects: groupsWithProjects.groupsWithProjects })
    } catch (error) {
      console.error(error)
      res.status(500).send('Failed to load projects.')
    }
  }
}
