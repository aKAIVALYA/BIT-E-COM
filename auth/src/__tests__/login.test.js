import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js'; // your Express app
import User from '../models/user.model.js'; // your user model

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all data before each test
  await User.deleteMany({});
});

describe('POST /auth/login', () => {
  it('should login an existing user with correct credentials', async () => {
    // first, register a test user
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullname: {
          firstName: 'Test',
          lastName: 'User'
        }
      })
      .expect(201);

    // then, try logging in
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should fail with wrong password', async () => {
    // create a user
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullname: {
          firstName: 'Test',
          lastName: 'User'
        }
      })
      .expect(201);

    // attempt login with wrong password
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpass'
      })
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });

  it('should fail if user does not exist', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'nouser@example.com',
        password: 'password123'
      })
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });
});
