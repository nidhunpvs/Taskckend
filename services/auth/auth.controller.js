var fs = require('fs')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

var ObjectID = require('mongodb').ObjectID

var db = require('../common/database')
var validation = require('../common/validation')

// Database collection names
var USER_COLLECTION = 'user'
var USER_DETAILS = 'userDetails'
var CUSTOMER_COMPLAINT="userComplaint"

// PRIVATE and PUBLIC key
var privateKEYONE = fs.readFileSync('./private-one.key', 'utf8')
var privateKEYTWO = fs.readFileSync('./private-two.key', 'utf8')

function register (req, res, next) {
  let requestBody = req.body

  validation.registerSchema(requestBody, (err) => {
    if (err !== null) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in params', data: err })
    else {
      db.get().collection(USER_COLLECTION).find({ email: requestBody.email, active: true }).toArray().then((result) => {
        console.log(result)
        if (result !== null && result.length) res.status(402).send({ status: 'FAILED', auth: false, message: 'User exist with this email' })
        else {
          let today = new Date()
          let saltRounds = 10

          bcrypt.hash(requestBody.password, saltRounds, function (err, hash) {
            if (err) return res.status(500).send({ status: 'FAILED', message: 'Something went wrong', data: err })

            let insertData = {
              firstname: requestBody.firstname,
              lastname: requestBody.lastname,
              email: requestBody.email,
              password: hash,
              phone: requestBody.phone,
              role: requestBody.role,
              roleId: requestBody.roleId,
              active: true,
              createdDate: today,
              modifiedDate: today
            }

            db.get().collection(USER_COLLECTION).insertOne(insertData, (err, result) => {
              if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in registering user', data: err })
              else return res.status(201).send({ status: 'OK', message: 'User registered.', data: { email: result.ops[0].email, password: hash } })
            })
          })
        }
      })
    }
  })
}
// customer complaint customerComplaint
function addComlaint (req, res, next) {
  let requestBody = req.body
  console.log(requestBody,"hey")
  validation.customerComplaint(requestBody, (err) => {
    console.log(err,"ewer")
    if (err !== null) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in params', data: err })
    else {
      let today = new Date()
 
            let insertData = {
              firstname: requestBody.customerName,
              email: requestBody.email,
              phone: requestBody.phone,
              customerId: requestBody.customerId,
              titile: requestBody.titile,
              description: requestBody.description,
              active: true,
              createdDate: today,
              modifiedDate: today
            }

            db.get().collection(CUSTOMER_COMPLAINT).insertOne(insertData, (err, result) => {
              if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in registering user', data: err })
              else return res.status(201).send({ status: 'OK', message: 'Complaint registerd' })
            })
          
    }
  })
}

function login (req, res, next) {
  let requestBody = req.body
  console.log(requestBody,"123213")
  validation.loginSchema(requestBody, (err) => {
    if (err !== null) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in params', data: err })
    else {
      db.get().collection(USER_COLLECTION).findOne({ email: requestBody.email }, (err, user) => {
        console.log(user,"97868654")
        if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in fetching user', data: err })
        if (user) {
          bcrypt.compare(requestBody.password, user.password, function (err, result) {
            if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in fetching user details', data: err })
            if (result) {
              if (user.role === 'AGENT' && user.roleId === "1") {
                let token = jwt.sign({ id: user._id, role: user.role, roleId: user.roleId }, privateKEYONE)
                db.get().collection(USER_DETAILS).findOne({ userId: ObjectID(user._id), active: true }, (err, userDetails) => {
                  console.log(userDetails,"hey data")
                  if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in fetching user details', data: err })
                  else if (userDetails) {
                    db.get().collection(USER_DETAILS).updateOne({ userId: ObjectID(user._id), active: true }, { '$set': { 'token': token } }, (err, response) => {
                      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in updating token', data: err })
                      else {
                        delete user.password
                        return res.status(200).send({ status: 'OK', auth: true, message: 'User authenticated', data: { 'token': token, 'user': user } })
                      }
                    })
                  } else {
                    db.get().collection(USER_DETAILS).insertOne({ userId: user._id, token: token, active: true }, (err, response) => {
                      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in updating token', data: err })
                      else {
                        delete user.password
                        return res.status(200).send({ status: 'OK', auth: true, message: 'User authenticated', data: { 'token': token, 'user': user } })
                      }
                    })
                  }
                })
              } else if (user.role === 'CUSTOM' && user.roleId === "2") {
                // let token = jwt.sign({ id: user._id, role: user.role, roleId: user.roleId }, privateKEYTWO)
                // return res.status(200).send({ status: 'OK', auth: true, message: 'User authenticated', data: { 'token': token, 'user': user } })

                let token = jwt.sign({ id: user._id, role: user.role, roleId: user.roleId }, privateKEYTWO)
                db.get().collection(USER_DETAILS).findOne({ userId: ObjectID(user._id), active: true }, (err, userDetails) => {
                  if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in fetching user details', data: err })
                  else if (userDetails) {
                    db.get().collection(USER_DETAILS).updateOne({ userId: ObjectID(user._id), active: true }, { '$set': { 'token': token } }, (err, response) => {
                      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in updating token', data: err })
                      else {
                        delete user.password
                        return res.status(200).send({ status: 'OK', auth: true, message: 'User authenticated', data: { 'token': token, 'user': user } })
                      }
                    })
                  } else {
                    db.get().collection(USER_DETAILS).insertOne({ userId: user._id, token: token, active: true }, (err, response) => {
                      if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in updating token', data: err })
                      else {
                        delete user.password
                        return res.status(200).send({ status: 'OK', auth: true, message: 'User authenticated', data: { 'token': token, 'user': user } })
                      }
                    })
                  }
                })
              } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'Couldn\'t generate token' })
            } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'Wrong password' })
          })
        } else return res.status(401).send({ status: 'FAILED', auth: false, message: 'User doesn\'t exist with this email' })
      })
    }
  })
}
function getComplaint (req, res) {

  db.get().collection(CUSTOMER_COMPLAINT).find({},{}).toArray().then(result => {
    return res.status(201).send({status:'OK',message:'success',data:result})
  }).catch(err=>{
    return res.status(401).send({status:'FAILED',message:'No data found'})
  })
}
function logout (req, res) {
  let requestData = req.body

  db.get().collection(USER_DETAILS).updateOne({ userId: ObjectID(requestData.decoded.id), active: true }, { '$set': { 'token': null } }, (err, response) => {
    if (err) return res.status(401).send({ status: 'FAILED', auth: false, message: 'Error in logging out', data: err })
    else return res.status(200).send({ status: 'OK', auth: false, message: 'User logged out' })
  })
}

module.exports = {
  register,
  login,
  logout,
  addComlaint,
  getComplaint
}
