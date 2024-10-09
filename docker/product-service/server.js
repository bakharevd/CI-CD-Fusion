const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const client = require('prom-client');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const productCounter = new client.Counter({
    name: 'product_requests_total',
    help: 'Total number of product requests',
    labelNames: ['method']
});

let products = [];

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/products', (req, res) => {
    productCounter.inc({ method: 'GET' });
    res.json(products);
});

app.post('/products', (req, res) => {
    productCounter.inc({ method: 'POST' });
    const product = req.body;
    products.push(product);
    res.status(201).json(product);
});

app.delete('/products/:id', (req, res) => {
    productCounter.inc({ method: 'DELETE' });
    const { id } = req.params;
    products = products.filter(product => product.id !== id);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Product Service running in http://localhost:${PORT}`);
});
