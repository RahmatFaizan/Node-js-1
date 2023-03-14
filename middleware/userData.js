import { config } from "dotenv";
import Jwt from "jsonwebtoken";
config();
export default function userData(req, res, next) {
    const token = req.header('auth-token');
    if (!token) res.status(401).send({ error: 'Unauthorized! Invalid token' });
    try {
        const data = Jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Unauthorized! Invalid token' });
    }
}
