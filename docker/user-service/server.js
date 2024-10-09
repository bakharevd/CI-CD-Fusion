const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const userCounter = new client.Counter({
    name: 'user_requests_total',
    help: 'Total number of user requests',
    labelNames: ['method']
});

let users = [];

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/users', (req, res) => {
    userCounter.inc({ method: 'GET' });
    res.json(users);
});

app.post('/users', (req, res) => {
    userCounter.inc({ method: 'POST' });
    const user = req.body;
    users.push(user);
    res.status(201).json(user);
});

app.delete('/users/:id', (req, res) => {
    userCounter.inc({ method: 'DELETE' });
    const { id } = req.params;
    users = users.filter(user => user.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`User Service running in http://localhost:${PORT}`);
});
