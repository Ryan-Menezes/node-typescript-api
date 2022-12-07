import {
  Controller,
  Get,
  ClassMiddleware,
  Middleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import { Forecast } from '@src/services/forecast';
import { BaseController } from '@src/controllers/index';
import { BeachRepository } from '@src/repositories';
import rateLimit from 'express-rate-limit';
import ApiError from '@src/util/errors/api-error';

const forecast = new Forecast();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many requests to the /forecast endpoint',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private readonly beachRepository: BeachRepository) {
    super();
  }

  @Get('')
  @Middleware(rateLimiter)
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await this.beachRepository.findAllBeachesForUser(
        req.decoded?.id as string
      );
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).json(forecastData);
    } catch (error) {
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong!',
      });
    }
  }
}
