import { Beach } from '@src/models/Beach';
import { User } from '@src/models/User';
import AuthService from '@src/services/auth';

describe.only('Beaches functional tests', () => {
  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      name: 'John Doe',
      email: 'john@mail.com',
      password: '123',
    }).save();

    token = AuthService.generateToken(user.toJSON());
  });

  describe('When creating a new beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const { status, body } = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 400 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const { status, body } = await global.testRequest
        .post('/beaches')
        .set({
          'x-access-token': token,
        })
        .send(newBeach);

      expect(status).toBe(400);
      expect(body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'request/body/lat must be number',
      });
    });

    it.skip('should return 500 when there is an error other than validation error', async () => {
      // TODO
    });
  });
});
