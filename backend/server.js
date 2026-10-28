require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;
let dbReady = false;
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true, database: dbReady }));
// Refuse API calls with a clear message if Atlas is not connected
app.use('/api/transactions', (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({ message: 'Database is not connected. Check the backend terminal for details.' });
  }
  next();
});
app.use('/api/transactions', transactionRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Invalid JSON bodies and any other unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));

connectDB()
  .then(() => {
    dbReady = true;
    const where = process.env.MONGODB_URI.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'MongoDB';
    console.log(`Connected to ${where} (database: ${process.env.DB_NAME || 'home_budget'}) Database connection succesfull`);
  })
  .catch((err) => {
    console.error('\nCould NOT connect to MongoDB Atlas:', err.message);
    console.error('Please check:');
    console.error(' 1. MONGODB_URI in backend/.env is correct (no < > brackets around the password).');
    console.error(' 2. The database user and password exist in Atlas > Database Access.');
    console.error(' 3. Your IP address is allowed in Atlas > Network Access (use "Allow access from anywhere" for the demo).');
    console.error(' 4. Special characters in the password are URL-encoded (e.g. @ becomes %40).\n');
  });
