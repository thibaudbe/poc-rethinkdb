const r = require('rethinkdb')
const config = require('../config/database')

// // creates database
// r.dbCreate('login')

// // creates tables in the database
// r.db('login').tableCreate('users')
// r.db('login').tableCreate('codes')

module.exports.connect = (req, res, next) => {
  r.connect(config, (err, conn) => {
    if (err) throw err

    console.log('Connecting RethinkDB...')
    req._rdb = conn
    next()
  })
}

module.exports.close = (req, res, next) => {
  req._rdb.close()
}
