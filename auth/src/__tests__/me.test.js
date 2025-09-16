import request from 'supertest';
import app from '../app'; // your Express app

describe('GET /api/auth/me', () => {
  it('should return current user details when authorized', async () => {
    // First login (or register) to get a token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
