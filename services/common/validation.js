const Joi = require('joi')

function validateJoi (params, schema, callback) {
  Joi.validate(params, schema, (err) => {
    if (err === null) callback(null)
    else callback(err)
  })
}

function registerSchema (requestBody, callback) {
  let schema = Joi.object().keys({

    firstname: Joi.string().min(3).max(10).required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    phone: Joi.string().regex(/^\d+$/).required(),
    role: Joi.string().valid('AGENT', 'CUSTOM').required(),
    roleId: Joi.number().min(1).max(4).integer().required()
  })

  validateJoi(requestBody, schema, callback)
}

function customerComplaint (requestBody, callback) {
  let schema = Joi.object().keys({
    titile: Joi.string().required(),
    description: Joi.string().required(),
    customerName:Joi.string(),
    phone:Joi.string(),
    customerId:Joi.string(),
    email:Joi.string()
  })

  validateJoi(requestBody, schema, callback)
}

function loginSchema (requestBody, callback) {
  let schema = Joi.object().keys({

    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()

  })

  validateJoi(requestBody, schema, callback)
}




module.exports = {
  loginSchema,
  registerSchema,
  customerComplaint
}
