const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: '',
        password: '',
        database: 'events'
    }
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Server is working');
})

app.post('/signin', async (req, res) => {
    const login = await db.select('email', 'hash').from('login').where('email', '=', req.body.email);
    console.log(login, 'test-login');
    if (login[0]) {
        const isValid = bcrypt.compareSync(req.body.password, login[0].hash);
        if (isValid) {
            const user = await db.select('*').from('users').where('email', '=', req.body.email);
            user[0] ? res.status(200).json(user[0]) : res.status(400).json('unable to get user');
        }
    } else {
        res.status(400).json('wrong credentials')
    }
})

app.post('/register', async (req, res) => {
    
    let { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await db.transaction(async trx => {
        const newLogin = {hash, email};
        const loginEmail = await trx.insert(newLogin).into('login').returning('email');
        if(loginEmail) {
            const newUser = { username, email, created: Date.now() }
            const id = await trx.insert(newUser).into('users').returning('id');
            id ? res.status(201).json(id[0]) : res.status(400).json('unable to register');
        }else{
            res.status(400).json('unable to register');
        }
      })
})

app.listen(3000, () => {
    console.log('App is running on port 3000');
});