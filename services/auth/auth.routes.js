var express = require('express')
var router = express.Router()

var essential = require('../common/essential')
var authController = require('./auth.controller')

router.route('/register')
  .post(authController.register)

router.route('/login')
  .post(authController.login)
  router.route('/addComlaint')
  .post(authController.addComlaint)
  router.route('/getComplaint')
  .post(authController.getComplaint)


router.route('/logout')
  .get(essential.verifyAnyToken, authController.logout)

module.exports = router
