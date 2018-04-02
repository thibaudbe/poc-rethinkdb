const r = require('rethinkdb')
const config = require('../config/database')
const connect = require('../lib/connect')

module.exports = (io) => {
  try {
    r.connect(config, (err, conn) => {
      if (err) throw err
      io.on('connection', (client) => {
        r.db('auth').table('users')
          .run(conn)
          .then(cursor => cursor.toArray())
          .then(result => {
            io.sockets.emit('/getUsers', result)
          })
          .catch(error => { throw error })

        client.on('/postUser', (user) => {
          const user = Object.assign({}, {
            email: user.email,
            name: user.name
          })
          r.db('auth').table('users')
            .insert(user, { returnChanges: true })
            .run(conn)
            .then(cursor => {
              cursor.changes.forEach((change) => {
                io.sockets.emit('/updateUsersAfterPost', change.new_val)
              })
            })
            .catch(error => { throw error })
        })

        client.on('/deleteUser', (userId) => {
          r.db('auth').table('users')
            .get(userId)
            .delete({ returnChanges: true })
            .run(conn)
            .then(cursor => {
              cursor.changes.forEach((change) => {
                io.sockets.emit('/updateUsersAfterDelete', change.old_val)
              })
            })
            .catch(error => { throw error })
        })
        
        client.on('/editUser', (user) => {
          r.db('auth').table('users')
            .get(userId)
            .update({
              email: user.email,
              name: user.name
            })
            .run(conn)
            .then(cursor => {
              cursor.changes.forEach((change) => {
                io.sockets.emit('/updateUsersAfterEdit', change.new_val)
              })
            })
            .catch(error => { throw error })
        })
      })
    })
  } catch (err) {
    throw err
  }
}
