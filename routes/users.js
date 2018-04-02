const r = require('rethinkdb')
const router = require('express').Router()
const connect = require('../lib/connect')

router.post('/users', (req, res) => {
  let user = Object.assign({}, {
    email: req.body.email,
    name: req.body.name
  })

  r.db('auth').table('users')
    .insert(user)
    .run(req._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      res.send(result)
    })
    .catch(error => res.send(error))
})

router.get('/users', (req, res) => {
  r.db('auth').table('users')
    .run(req._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      res.send(result)
    })
    .catch(error => res.send(error))
})

router.put('/users/:user_id', (req, res) => {
  let user_id = req.params.user_id

  r.db('auth').table('users')
    .get(user_id)
    .update({
      email: req.body.email,
      name: req.body.name
    })
    .run(req._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      res.send(result)
    })
    .catch(error => res.send(error))
})

router.delete('/users/:user_id', (req, res) => {
  let user_id = req.params.user_id

  r.db('auth').table('users')
    .get(user_id)
    .delete()
    .run(req._rdb)
    .then(cursor => cursor.toArray())
    .then(result => {
      res.send(result)
    })
    .catch(error => res.send(error))
})

module.exports = router
