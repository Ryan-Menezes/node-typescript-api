import { Beach } from '@src/models/Beach';

describe('Beaches functional tests', () => {
  beforeAll(async () => {
    await Beach.deleteMany({});
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
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: 'E',
      };

      const { status, body } = await global.testRequest
        .post('/beaches')
        .send(newBeach);

      expect(status).toBe(422);
      expect(body).toEqual({
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it.skip('should return 500 when there is an error other than validation error', async () => {
      // TODO
    });
  });
});
