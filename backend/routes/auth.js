const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

//create a user using: POST "api/auth/createuser". No login needed.
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have a minimum of 5 characters').isLength({ min: 5}),
], async (req, res) => {
    // if there are errors, return Bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    // Check whether the user with the same email exists already
    try{

        let user = await User.findOne({email: req.body.email})
        if(user){
            return res.status(400).json({error: 'Sorry a user with this email already exists'})
        }
        const salt = await bcrypt.genSalt(10);
        const securedPassword = await bcrypt.hash(req.body.password, salt);
        //create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securedPassword,
        })
        
        res.json({message: 'User created successfully', user})
    }
    catch(error){
       console.error(error.message);
       res.status(500).send("Some error occured");
    }    
})

module.exports = router;