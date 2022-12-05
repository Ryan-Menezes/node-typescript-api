import { Response } from 'express';
import mongoose from 'mongoose';
import { CustomValidation } from '@src/models/User';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/errors/api-error';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: unknown
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      this.sendErrorResponse(res, clientErrors);
    } else {
      logger.error(error);

      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong!',
      });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): APIError {
    const duplicatedFindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CustomValidation.DUPLICATED
    );

    if (duplicatedFindErrors.length) {
      return {
        code: 409,
        message: error?.message,
      };
    }

    return {
      code: 400,
      message: error?.message,
    };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
