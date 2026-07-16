/**
 * Reset admin script — run once, then delete this file.
 * Usage: node reset-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI;
const NEW_EMAIL = 'admin@MultiArt AI.com';
const NEW_PASSWORD = 'Admin@1234';
const NEW_NAME = 'Admin';

async function reset() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Drop all existing admins
  await mongoose.connection.collection('admins').deleteMany({});
  console.log('🗑️  Cleared existing admin accounts');

  // Create fresh admin with hashed password
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);
  await mongoose.connection.collection('admins').insertOne({
    name: NEW_NAME,
    email: NEW_EMAIL,
    passwordHash,
    role: 'super',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('');
  console.log('✅ Admin account created successfully!');
  console.log('   Email   :', NEW_EMAIL);
  console.log('   Password:', NEW_PASSWORD);
  console.log('');
  console.log('👉 Login at http://localhost:3001/login');
  await mongoose.disconnect();
}

reset().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
