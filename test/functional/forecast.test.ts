import nock from 'nock';
import { Beach, GeoPosition } from '@src/models/Beach';
import { User } from '@src/models/User';
import AuthService from '@src/services/auth';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';

describe('Beach forecast functional tests', () => {
  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User({
      name: 'John Doe',
      email: 'john@mail.com',
      password: '123',
    }).save();

    await new Beach({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    }).save();

    token = AuthService.generateToken(user.toJSON());
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
      })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
        end: /(.*)/,
      })
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest.get('/forecast').set({
      'x-access-token': token,
    });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
      })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
        end: /(.*)/,
      })
      .replyWithError('Something went wrong');

    const { body, status } = await global.testRequest.get('/forecast').set({
      'x-access-token': token,
    });

    expect(status).toBe(500);
    expect(body).toEqual({
      code: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong!',
    });
  });
});
