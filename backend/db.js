const { MongoClient } = require('mongodb');
let collection = null;
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'home_budget';
  if (!uri || uri.includes('<password>') || uri.includes('<username>')) {
    throw new Error('MONGODB_URI is missing or still contains placeholders. Edit backend/.env.');
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  collection = client.db(dbName).collection('transactions');
  await collection.createIndex({ transactionId: 1 }, { unique: true });
  return collection;
}
function getCollection() {
  if (!collection) throw new Error('Database is not connected');
  return collection;
}
module.exports = { connectDB, getCollection };
