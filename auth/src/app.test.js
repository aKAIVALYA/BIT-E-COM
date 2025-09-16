const request = require('supertest');
const app = require('./app'); // Adjust the path as necessary
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('user');
  });
});