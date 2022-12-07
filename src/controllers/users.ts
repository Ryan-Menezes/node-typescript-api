/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import { BaseController } from '@src/controllers/index';
import { UserRepository } from '@src/repositories';
import AuthService from '@src/services/auth';

@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userRepository.create(req.body);

      res.status(201).send(user);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const user = await this.userRepository.findOne({ email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });
    }

    if (!(await AuthService.comparePassword(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password is not match!',
      });
    }

    const token = AuthService.generateToken(user);

    return res.status(200).send({ token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<Response> {
    const email = req.decoded?.email;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found!',
      });
    }

    return res.status(200).send({ user });
  }
}
