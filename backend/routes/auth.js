const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECERT = 'Deepuisthebest$justkeepworking^hard';

// ROUTE 1: Create a user using: POST "api/auth/createuser". No login needed.
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
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECERT);
        res.json({message: 'User created successfully', authToken})
    }
    catch(error){
       console.error(error.message);
       res.status(500).send("Internal Server Error");
    }    
})

// ROUTE 2 : Authenticate a user using: POST "api/auth/login". No login needed.
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res) => {
    // if there are errors, return Bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ error: "Please enter valid login credentials"});
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password);
        if(!isCorrectPassword){
            return res.status(400).json({ error: "Please enter valid login credentials"});
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECERT);
        res.json({authToken})

    } 
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }  
})

// ROUTE 3 : Get loggedIn user details using: POST "api/auth/getuser". Login needed.
router.get('/getuser', fetchUser, async (req, res) => {
    try{
        const userId = req.user.id;
        const userDetails = await User.findById(userId).select("-password");
        res.send(userDetails); 
    }
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;