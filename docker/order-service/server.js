const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

const orderCounter = new client.Counter({
    name: 'order_requests_total',
    help: 'Total number of order requests',
    labelNames: ['method']
});

let orders = [];

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/orders', (req, res) => {
    orderCounter.inc({ method: 'GET' });
    res.json(orders);
});

app.post('/orders', (req, res) => {
    orderCounter.inc({ method: 'POST' });
    const order = req.body;
    orders.push(order);
    res.status(201).json(order);
});

app.delete('/orders/:id', (req, res) => {
    orderCounter.inc({ method: 'DELETE' });
    const { id } = req.params;
    orders = orders.filter(order => order.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Order Service running on http://localhost:${PORT}`);
});