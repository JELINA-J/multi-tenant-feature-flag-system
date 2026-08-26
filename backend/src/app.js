const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/organizations');
const flagRoutes = require('./routes/flags');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/flags', flagRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
