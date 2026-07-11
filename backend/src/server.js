require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/organizations');
const flagRoutes = require('./routes/flags');

const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/flags', flagRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
