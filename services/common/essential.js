var fs = require('fs')
var jwt = require('jsonwebtoken')

var db = require('./database')

var USER_DETAILS = 'userDetails'

var privateKEYONE = fs.readFileSync('./private-one.key', 'utf8')
var privateKEYTWO = fs.readFileSync('./private-two.key', 'utf8')

function verifyAdminToken (req, res, next) {
  let token = req.headers['x-access-token']
  if (!token) return res.status(401).send({ status: 'FAILED', auth: false, message: 'No token provided.' })
  else {
    db.get().collection(USER_DETAILS).findOne({ 'token': token }, (err, result) => {
      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token verification failed.' })
      else if (result) {
        jwt.verify(token, privateKEYONE, function (err, decoded) {
          if (err) return res.status(403).send({ status: 'FAILED', auth: false, message: 'Failed to authenticate token.' })
          else {
            req.body.decoded = decoded
            next()
          }
        })
      } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token not found in database.' })
    })
  }
}

function verifyUserToken (req, res, next) {
  let token = req.headers['x-access-token']
  if (!token) return res.status(401).send({ status: 'FAILED', auth: false, message: 'No token provided.' })
  else {
    db.get().collection(USER_DETAILS).findOne({ 'token': token }, (err, result) => {
      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token verification failed.' })
      else if (result) {
        jwt.verify(token, privateKEYTWO, function (err, decoded) {
          if (err) return res.status(403).send({ status: 'FAILED', auth: false, message: 'Failed to authenticate token.' })
          else {
            req.body.decoded = decoded
            next()
          }
        })
      } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token not found in database.' })
    })
  }
}

function verifyAnyToken (req, res, next) {
  let token = req.headers['x-access-token']
  if (!token) return res.status(401).send({ status: 'FAILED', auth: false, message: 'No token provided.' })
  else {
    db.get().collection(USER_DETAILS).findOne({ 'token': token }, (err, result) => {
      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token verification failed.' })
      else if (result) {
        jwt.verify(token, privateKEYONE, function (err, decoded) {
          if (err) {
            jwt.verify(token, privateKEYTWO, function (err, decoded) {
              if (err) return res.status(403).send({ status: 'FAILED', auth: false, message: 'Failed to authenticate token.' })
              else {
                req.body.decoded = decoded
                next()
              }
            })
          } else {
            req.body.decoded = decoded
            next()
          }
        })
      } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'Token not found in database.' })
    })
  }
}

module.exports = {
  verifyAdminToken,
  verifyUserToken,
  verifyAnyToken
}
