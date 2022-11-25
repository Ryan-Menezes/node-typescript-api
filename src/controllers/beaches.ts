import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { BaseController } from '@src/controllers/index';
import { Beach } from '@src/models/Beach';

@Controller('beaches')
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body);
      const newBeach = await beach.save();

      res.status(201).send(newBeach);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
