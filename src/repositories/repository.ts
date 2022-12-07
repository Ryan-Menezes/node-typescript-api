import { BaseRepository, WithId, FilterOptions } from '@src/repositories';

export class DatabaseError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export class DatabaseInternalError extends DatabaseError {}

export class DatabaseValidationError extends DatabaseError {}

export class DatabaseUnknownClientError extends DatabaseError {}

export abstract class Repository<T> implements BaseRepository<T> {
  public abstract create(data: T): Promise<WithId<T>>;
  public abstract find(options: FilterOptions): Promise<Array<WithId<T>>>;
  public abstract findOne(options: FilterOptions): Promise<WithId<T>>;
}
