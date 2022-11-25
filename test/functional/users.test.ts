import { User } from '@src/models/User';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'João Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const { status, body } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newUser));
    });
  });
});
