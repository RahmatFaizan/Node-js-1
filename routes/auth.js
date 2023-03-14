import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../modules/User.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import userData from '../middleware/userData.js';
config();

const router = express.Router();

async function checkforuser(req) {
    let user = await User.findOne(req);
    let name = Object.keys(req)[0];
    return { user, name };
}

//* Route 1 : Delete User by Email 

router.delete('/delete', [
    body('email').isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let email = req.body.email;
        await User.findOneAndDelete({ email });
        res.status(200).json({ message: 'Successfully deleted!' })
    } catch (error) {
        console.error(error);
        res.status(500).send('Interval Server Error!')
    }
})


// * Route 2 : Create a User 

router.post('/create', [
    body('username').isLength({ min: 6 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('hidden').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let { email, username, name, password } = req.body;

        let user;
        user = await checkforuser({ email });
        if (!user.user) user = await checkforuser({ username });
        if (user.user) return res.status(200).json({ message: user.name + ' already exist', user: user.user });
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        let srcPassword = hash;
        User.create({
            name,
            email,
            username,
            password: srcPassword
        }).then(user => {
            const data = {
                user: {
                    id: user.id
                }
            }
            let authTokken = jwt.sign(data, process.env.JWT_SECRET_KEY)
            res.json({ authTokken });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Interval Server Error!')
    }
})


//* Route 3 : User Login Authentication 

router.post('/login', [
    body('email', 'Invalid Email!').isEmail(),
    body('password', 'Password must not be empty').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {

        let { password, email } = req.body;
        let { user } = await checkforuser({ email })
        if (!user) {
            return res.status(400).json({ error: 'Invalid Credientials!' })
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Invalid Credientials!' })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        let authTokken = jwt.sign(data, process.env.JWT_SECRET_KEY)
        res.json({ authTokken });

    } catch (error) {
        console.error(error);
        res.status(500).send('Interval Server Error!')
    }
})

//* Route 3 : User Login Authentication 
router.post('/getuser', userData, async (req, res) => {
    try {
        let id = req.user.id;
        let user = await User.findById(id).select("-password");
        if (user) res.status(200).json(user);
        else res.status(404).json({ user: 'User not found' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Interval Server Error!')
    }
})
// *END

export default router;