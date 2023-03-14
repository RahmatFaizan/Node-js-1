import connect from "./mongo.js";
import express from "express";
import auth from './routes/auth.js'
import notes from './routes/notes.js'
connect();
const app = express();
const port = 3000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World')
});

app.use('/api/v1/user', auth);
app.use('/api/v1/user/notes', notes);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})