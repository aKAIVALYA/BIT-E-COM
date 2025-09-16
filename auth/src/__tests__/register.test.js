const request = require('supertest');
const app = require('../app')
connectDB = require('../db/db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;


describe('POST /api/auth/register', ()=> {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
   
  it('create a user and return 201 with user (no password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'john@example.com',
        password: 'password',
        fullname: { firstName: 'John', lastName: 'Doe' } // <-- use 'fullname'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate username or email', async () =>{
    const payload ={
      username: 'testuser',
      email: 'dup@example.com',
      password: 'password',
      fullName: { firstName: 'Dup', lastName: 'User' },
    };

    (await request(app).post('/api/auth/register').send(payload)).expect(201);
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.statusCode).toEqual(409);
  });

  it('rejects invalid input data', async () =>{
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toEqual(400);
  });


});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await mongoose.disconnect();
  await mongoServer.stop();
});