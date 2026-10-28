const express = require('express');
const { getCollection } = require('../db');

const router = express.Router();

// ---------- helpers ----------

// Creates an ID like INC-MGH3K2ABCD or EXP-MGH3K2ABCD
function generateId(type) {
  const prefix = type === 'income' ? 'INC' : 'EXP';
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${random}`;
}

const ID_PATTERN = /^(INC|EXP)-[A-Z0-9]+$/;

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// Checks the request body. Returns { errors, data }.
function validate(body, requireType) {
  const errors = [];
  const type = body.type;
  const category = String(body.category ?? '').trim();
  const description = String(body.description ?? '').trim();
  const amount = Number(body.amount);
  const date = body.date;

  if (requireType && type !== 'income' && type !== 'expense') errors.push('Type must be "income" or "expense".');
  if (!category) errors.push(type === 'income' ? 'Income source is required.' : 'Category is required.');
  if (type === 'expense' && !description) errors.push('Description is required for an expense.');
  if (body.amount === '' || body.amount == null || !Number.isFinite(amount) || amount <= 0) errors.push('Amount must be a number greater than 0.');
  if (!isValidDate(date)) errors.push('Date must be valid (YYYY-MM-DD).');

  return { errors, data: { type, category, description, amount: Math.round(amount * 100) / 100, date } };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------- routes ----------

// POST /api/transactions  -> insert
router.post('/', async (req, res, next) => {
  try {
    const { errors, data } = validate(req.body, true);
    if (errors.length) return res.status(400).json({ message: errors.join(' '), errors });

    const col = getCollection();
    // Retry in the (very unlikely) case the generated ID already exists
    for (let attempt = 0; attempt < 5; attempt++) {
      const doc = { transactionId: generateId(data.type), ...data, createdAt: new Date() };
      try {
        await col.insertOne(doc);
        return res.status(201).json(doc);
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
    res.status(500).json({ message: 'Could not generate a unique transaction ID' });
  } catch (err) { next(err); }
});

// GET /api/transactions?q=text&date=YYYY-MM-DD  -> select (with optional search)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const q = String(req.query.q ?? '').trim();
    const date = String(req.query.date ?? '').trim();

    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ transactionId: regex }, { category: regex }];
    }
    if (date) {
      if (!isValidDate(date)) return res.status(400).json({ message: 'Search date must be valid (YYYY-MM-DD).' });
      filter.date = date;
    }

    const list = await getCollection().find(filter).sort({ date: -1, createdAt: -1 }).toArray();
    res.json(list);
  } catch (err) { next(err); }
});

// GET /api/transactions/:id  -> one record
router.get('/:id', async (req, res, next) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID format.' });
    const doc = await getCollection().findOne({ transactionId: req.params.id });
    if (!doc) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(doc);
  } catch (err) { next(err); }
});

// PUT /api/transactions/:id  -> update (type and ID cannot be changed)
router.put('/:id', async (req, res, next) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID format.' });

    const col = getCollection();
    const existing = await col.findOne({ transactionId: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Transaction not found.' });

    const { errors, data } = validate({ ...req.body, type: existing.type }, false);
    if (errors.length) return res.status(400).json({ message: errors.join(' '), errors });

    const { type, ...fields } = data;
    const updated = await col.findOneAndUpdate(
      { transactionId: req.params.id },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (!ID_PATTERN.test(req.params.id)) return res.status(400).json({ message: 'Invalid transaction ID format.' });
    const result = await getCollection().deleteOne({ transactionId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
