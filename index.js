const mongoose = require('mongoose')
const express = require('express')

const car = require('./routes/cars')
const user = require('./routes/users')
const company = require('./routes/companies')
const sale = require('./routes/sales')
const auth = require('./routes/auth')

const app = express()
app.use(express.json())
app.use('/api/cars/', car)
app.use('/api/users/', user)
app.use('/api/companies/', company)
app.use('/api/sales/', sale)
app.use('/api/auth/', auth)
const port = process.env.PORT || 3003
app.listen(port, () => console.log('Listening to port: ' + port + '...'))

mongoose.connect('mongodb://localhost/carsbbdd', { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => console.log('Conectado a MongoDb'))
    .catch(erro => console.log('No se ha conectado a MongoDb'))