const express = require('express')
const Car = require('../models/car')
const auth=require('./middleware/auth')
const Role=require('../helper/roles')
const authorize=require('./middleware/role')
const { Company } = require('../models/company')
const router = express.Router()
const { check, validationResult } = require('express-validator');

router.get('/', [auth,authorize([Role.Admin])],async (req, res) => {
    const cars = await Car
        .find()
        //.populate('company', 'name country') //per modelo de datos NORMALIZADO
    res.send(cars)
})

router.get('/:id', async (req, res) => {
    const car = await Car.findById(req.params.id)
    if (!car) return res.status(404).send('No hemos encontrado un coche con ese ID')
    res.send(car)
})
//POST MODELO DE DATOS EMBEBIDO
router.post('/', [
    check('model').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const company = await Company.findById(req.body.companyId)
    if (!company) return res.status(400).send('No existe ese fabricante.')
    const car = new Car({
        company: company,
        model: req.body.model,
        year: req.body.year,
        sold: req.body.sold,
        price: req.body.price,
        extras: req.body.extras
    })

    const result = await car.save()
    res.status(201).send(result)
})
/*POST MODELO DE DATOS NORMALIZADO
router.post('/', [
    check('model').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const car = new Car({
        company: req.body.company,
        model: req.body.model,
        year: req.body.year,
        sold: req.body.sold,
        price: req.body.price,
        extras: req.body.extras
    })

    const result = await car.save()
    res.status(201).send(result)
})
*/
router.put('/:id', [
    check('model').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, {
        company: req.body.company,
        model: req.body.model,
        year: req.body.year,
        sold: req.body.sold,
        price: req.body.price,
        extras: req.body.extras
    },
        {
            new: true
        })

    if (!car) {
        return res.status(404).send('El coche con ese ID no existe')
    }

    res.status(200).send(car)
})

router.delete('/:id', async (req, res) => {

    const car = await Car.findByIdAndDelete(req.params.id)

    if (!car) {
        return res.status(404).send('El coche con ese ID no existe.')
    }

    res.status(200).send('Coche eliminado correctamente.')

})

module.exports = router