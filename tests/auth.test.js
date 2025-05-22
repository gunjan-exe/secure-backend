// tests/auth.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // <-- Add this
dotenv.config();

const app = require('../app'); // Ensure app is exported without listen()

beforeAll(async () => {
  const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';
  await mongoose.connect(dbUrl);
});

afterAll(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      try {
        await collection.deleteMany({});
      } catch (err) {
        console.error(`Error cleaning up collection ${collection.collectionName}`, err);
      }
    }
  }
  await mongoose.connection.close();
});

describe('Authentication Routes', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Test12345!';
  let userId;

  test('Register a new user and verify email', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: testEmail, password: testPassword });

  expect([200, 201]).toContain(res.statusCode);
  expect(res.body).toHaveProperty('message');
  expect(res.body.message).toMatch(/registered/i);
  console.log('Register response:', res.body);

  const user = await User.findOne({ email: testEmail });
  expect(user).not.toBeNull();

  const verifyToken = user.verificationToken;

  const verifyRes = await request(app)
    .get(`/api/auth/verify-registration?token=${verifyToken}`);

  expect([200, 302]).toContain(verifyRes.statusCode);
  console.log('Verify response status:', verifyRes.statusCode);
});



  test('Login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    console.log('Login response:', res.body);
  });

  test('Request password reset link', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/reset link sent/i);
    console.log('Reset response:', res.body);
  });
});
