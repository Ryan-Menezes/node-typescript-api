import { Response } from 'express';
import mongoose from 'mongoose';
import { CustomValidation } from '@src/models/User';
import logger from '@src/logger';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: unknown
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(clientErrors);
    } else {
      logger.error(error);

      res.status(500).send({
        code: 500,
        error: 'Something went wrong!',
      });
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedFindErrors = Object
      .values(error.errors)
      .filter(err => err.kind === CustomValidation.DUPLICATED);

    if (duplicatedFindErrors.length) {
      return {
        code: 409,
        error: error?.message,
      };
    }

    return {
      code: 422,
      error: error?.message,
    };
  }
}
