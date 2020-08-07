const admin=require('./middleware/admin')
const auth=require('./middleware/auth')
const express = require('express')
const Sale = require('../models/sale')
const Car = require('../models/car')
const User = require('../models/user')
const mongoose = require('mongoose')
const router = express.Router()

router.get('/', [auth,admin],async (req, res) => {
    const sales = await Sale.find()
    res.send(sales)
})

router.post('/', auth,async (req, res) => {
    const user = await User.findById(req.body.userId)
    if (!user) return res.status(400).send('Este usuario no existe.')

    const car = await Car.findById(req.body.carId)
    if (!car) return res.status(400).send('Este coche no existe.')
    if (car.sold === true) return res.status(400).send('Este coche ya ha sido vendido.')

    const sale = new Sale({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
        car: {
            _id: car._id,
            model: car.model
        },
        price: req.body.price
    })

    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const result = await sale.save()
        user.isCustomer = true
        user.save()
        car.sold = true
        car.save()
        await session.commitTransaction()
        session.endSession()
        res.status(201).send(result)
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send(e.message)
    }
})
module.exports = router