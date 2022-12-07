/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable new-cap */
import { BaseModel } from '@src/models';
import { WithId, FilterOptions } from '@src/repositories';
import {
  DatabaseInternalError,
  DatabaseValidationError,
  DatabaseUnknownClientError,
  Repository,
} from '@src/repositories/repository';
import { Model, Error } from 'mongoose';
import { CustomValidation } from '@src/models/User';
import logger from '@src/logger';

export abstract class DefaultMongoDBRepository<
  T extends BaseModel
> extends Repository<T> {
  constructor(private readonly model: Model<T>) {
    super();
  }

  public async create(data: T): Promise<WithId<T>> {
    try {
      const model = new this.model(data);
      const createdData = await model.save();
      return createdData.toJSON<WithId<T>>() as WithId<T>;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async find(options: FilterOptions): Promise<Array<WithId<T>>> {
    try {
      const data = await this.model.find(options);
      return data.map((d) => d.toJSON<WithId<T>>() as WithId<T>);
    } catch (error) {
      this.handleError(error);
    }
  }

  public async findOne(options: FilterOptions): Promise<WithId<T>> {
    try {
      const data = await this.model.findOne(options);
      return data?.toJSON<WithId<T>>() as WithId<T>;
    } catch (error) {
      this.handleError(error);
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).map(
        (err) =>
          err.name === 'ValidatorError' &&
          err.kind === CustomValidation.DUPLICATED
      );

      if (duplicatedKindErrors.length) {
        throw new DatabaseValidationError(error.message);
      }

      throw new DatabaseUnknownClientError(error.message);
    }

    logger.warn(`Database error ${error}`);

    throw new DatabaseInternalError(
      'Something unexpected happend to the database'
    );
  }
}
