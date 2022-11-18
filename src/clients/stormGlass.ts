import { InternalError } from '@src/util/errors/internal-error';
import config, { IConfig } from 'config';
import * as HTTPUtil from '@src/util/request';

export interface StormGlassPointSource {
  readonly [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  readonly hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellHeight: number;
  swellDirection: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';

  readonly stormGlassAPISource = 'noaa';

  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const url = stormGlassResourceConfig.get<string>('apiUrl');
    const token = stormGlassResourceConfig.get<string>('apiToken');

    try {
      const { data } = await this.request.get<StormGlassForecastResponse>(
        `${url}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`,
        {
          headers: {
            authorization: token,
          },
        }
      );

      return this.normalizeResponse(data);
    } catch (err: any) {
      const message: string = err?.message;
      const status: number = err?.response?.status;
      const data: object = err?.response?.data;

      if (HTTPUtil.Request.isRequestError(err)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(data)} Code: ${status}`
        );
      }

      throw new ClientRequestError(message);
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
