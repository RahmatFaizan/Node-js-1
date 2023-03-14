import express from 'express';
import userData from '../middleware/userData.js';
import Notes from '../modules/Notes.js';
import { validationResult, body } from 'express-validator';
const router = express.Router();

router.get('/all', userData, async (req, res) => {
    try {
        let notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error!" })
    }
})

router.delete('/delete/:id', userData, [
    body('id', 'Invalid value or Empty value').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        Notes.findById(req.body.id).then(async (note) => {
            if (note) {
                if (note.user == req.user.id) {
                    await Notes.findByIdAndDelete(req.body.id);
                    res.status(200).json({ msg: 'Successfully delete' })
                } else {
                    res.status(401).json({ msg: 'Not Allowed!' })
                }
            } else {
                res.status(404).json({ msg: 'Note not found!' })
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error!" })
    }
})


router.post('/add', userData, [
    body('title', 'Invalid value or Empty value').exists(),
    body('description', 'Invalid value or Empty value').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let userId = req.user.id;
        let { title, description, tag } = req.body
        Notes.create({
            user: userId,
            title, description, tag
        }).then(note => {
            res.status(200).json(note);
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error!" })
    }
})
export default router;