const express = require('express')
const { Company } = require('../models/company')
const router = express.Router()

router.get('/', async(req, res)=> {
    const companies = await Company.find()
    res.send(companies)
})

router.get('/:id', async(req, res)=>{
    const company = await Company.findById(req.params.id)
    if(!company) return res.status(404).send('No hemos encontrado una company con ese ID')
    res.send(company)
})

router.post('/',async(req, res)=>{

    const company = new Company({
        name: req.body.name,
        country: req.body.country
    })

    const result = await company.save()
    res.status(201).send(result)
})

router.put('/:id', async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const company = await Company.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        country: req.body.country
    },
    {
        new: true
    })

    if(!company){
        return res.status(404).send('La company con ese ID no existe')
    }
    
    res.status(200).send(company)
})

router.delete('/:id', async(req, res)=>{

    const company = await Company.findByIdAndDelete(req.params.id)

    if(!company){
        return res.status(404).send('La company con ese ID no existe.')
    }

    res.status(200).send('Company eliminada correctamente.')

})

module.exports = router