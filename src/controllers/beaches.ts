import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import { BaseController } from '@src/controllers/index';
import { Beach } from '@src/models/Beach';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({
        ...req.body,
        user: req.decoded?.id,
      });
      const newBeach = await beach.save();

      res.status(201).send(newBeach);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
