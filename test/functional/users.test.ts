import { User } from '@src/models/User';
import AuthService from '@src/services/auth';

describe('Users functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'João Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const { status, body } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      expect(body).toEqual(
        expect.objectContaining({
          ...newUser,
          password: expect.any(String),
        })
      );
      await expect(
        AuthService.comparePassword(newUser.password, body.password)
      ).resolves.toBeTruthy();
    });

    it('should return 400 when there is a validation error', async () => {
      const newUser = {
        email: 'john@mail.com',
        password: '1234',
      };

      const { status, body } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(400);
      expect(body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should return 400 when the email already exists', async () => {
      const newUser = {
        name: 'João Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      await global.testRequest.post('/users').send(newUser);
      const { status, body } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(400);
      expect(body).toEqual({
        code: 400,
        error: 'Bad Request',
        message:
          'User validation failed: email: already exists in the database.',
      });
    });

    it('should return 500 when there is an error other than validation error', async () => {
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(async () => {
        await Promise.reject('fail to create user');
      });

      const newUser = {
        name: 'João Doe',
        email: 'john@mail.com',
        password: '1234',
      };

      const { status, body } = await global.testRequest
        .post('/users')
        .send(newUser);

      expect(status).toBe(500);
      expect(body).toEqual({
        code: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong!',
      });
    });
  });

  describe('When authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new User(newUser).save();
      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: newUser.password,
        });

      expect(status).toBe(200);
      expect(body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: 'some-email@mail.com',
          password: '1234',
        });

      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'User not found!',
      });
    });

    it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      await new User(newUser).save();
      const { body, status } = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: 'different password',
        });

      expect(status).toBe(401);
      expect(body).toEqual({
        code: 401,
        error: 'Unauthorized',
        message: 'Password is not match!',
      });
    });
  });

  describe('When getting user profile info', () => {
    it("Should return the token's owner profile information", async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user.toJSON());
      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it('Should return Not Found, when the user is not found', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@mail.com',
        password: '1234',
      };
      const user = await new User(newUser);
      const token = AuthService.generateToken(user.toJSON());
      const { body, status } = await global.testRequest.get('/users/me').set({
        'x-access-token': token,
      });

      expect(status).toBe(404);
      expect(body.message).toBe('User not found!');
    });
  });
});
