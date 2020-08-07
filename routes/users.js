const bcrypt = require('bcryptjs')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
const { check, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
    const users = await User.find()
    res.send(users)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send('No hemos encontrado un user con ese ID')
    res.send(user)
})

router.post('/', [
    check('name').isLength({ min: 3 }),
    check('email').isLength({ min: 3 }),
    check('password').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('Email registrado ya.')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        isAdmin: req.body.isAdmin,
        isCustomer: false,
    })

    await user.save()
    const jwtToken = user.generateJWT()
    res.status(201).header('Authorization', jwtToken).send({
        _id: user._id,
        name: user.name,
        email: user.email
    })
})

router.put('/:id', [
    check('name').isLength({ min: 3 }),
    check('email').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        isCustomer: req.body.isCustomer
    },
        {
            new: true
        })

    if (!user) {
        return res.status(404).send('El user con ese ID no existe')
    }

    res.status(200).send(user)
})

router.delete('/:id', async (req, res) => {

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
        return res.status(404).send('El user con ese ID no existe.')
    }

    res.status(200).send('User eliminado correctamente.')

})

module.exports = router