const express = require('express');
const router = express.Router();
const Notes = require('../models/Note')
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// ROUTE 1 : Get all notes of a user using: GET "api/notes/fetchallnotes". Login needed.
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try{
        // find if there are any notes associateed with the user id given in the request body
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2 : Add a new Note using: POST "api/notes/addnote". Login needed.
router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must have a minimum of 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    // if there are errors, return Bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }    
    try{
        // get note details from request body
        const { title, description, tag } = req.body;
        // make a new note
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3 : Update an existing Note using: PUT "api/notes/updatenote". Login needed.
router.put('/updatenote/:id', fetchUser, async (req, res) => {

    // if there are errors, return Bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }    
    try{
        // get note details from request body
        const { title, description, tag } = req.body;
        // create a newNote object
        const newNote = {};
        if(title)   {newNote.title = title};
        if(description) (newNote.description = description);
        if(tag) (newNote.tag = tag);

        // Find the note to be updated
        let note = await Notes.findById(req.params.id);
        if(!note)   {res.status(404).send("Not Found")};

        // Check if the note author and the updator are same user
        if(note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
        res.json(note);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 4 : Delete an existing Note using: DELETE "api/notes/deletenote". Login needed.
router.delete('/deletenote/:id', fetchUser, async (req, res) => {

    // if there are errors, return Bad request and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }    
    try{
        // Find the note to be deleted
        let note = await Notes.findById(req.params.id);
        if(!note)   {res.status(404).send("Not Found")};

        // Allow deletion only is the user is the author of this note
        if(note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({message: "Note deleted successfully"});
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router;