const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const router = require('./routes');

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/seed', async (req, res) => {
    try {
        const seed = require('./seed');
        await seed();
        res.status(200).json({ message: 'Database seeded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api', router);

module.exports = app;