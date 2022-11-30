import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import { Forecast } from '@src/services/forecast';
import { BaseController } from '@src/controllers/index';
import { Beach } from '@src/models/Beach';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForLoggedUser(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({
        user: req.decoded?.id,
      });
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).json(forecastData);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
