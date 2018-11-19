const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const url = process.env.MONGO_HOST
const dbName = process.env.DB_NAME

var db

MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
  assert.strictEqual(null, err)
  console.log('Connected successfully to database')
  db = client.db(dbName)
})

exports.get = () => {
  return db
}
