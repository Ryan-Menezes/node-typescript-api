import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public create(req: Request, res: Response): void {
    res.status(201).send({ id: 'any-id', ...req.body });
  }
}
