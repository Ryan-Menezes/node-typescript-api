import { Response } from 'express';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/util/errors/api-error';
import {
  DatabaseError,
  DatabaseValidationError,
} from '@src/repositories/repository';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: unknown
  ): void {
    if (error instanceof DatabaseValidationError) {
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

  private handleClientErrors(error: DatabaseError): APIError {
    return {
      code: 400,
      message: error.message,
    };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
