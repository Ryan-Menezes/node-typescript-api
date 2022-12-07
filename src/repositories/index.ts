import { Beach } from '@src/models/Beach';
import { User } from '@src/models/User';

export type WithId<T> = { id: string } & T;

export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
  create(data: T): Promise<WithId<T>>;
  find(options: FilterOptions): Promise<Array<WithId<T>>>;
  findOne(options: FilterOptions): Promise<WithId<T>>;
}

export interface BeachRepository extends BaseRepository<Beach> {
  findAllBeachesForUser(userId: string): Promise<Array<WithId<Beach>>>;
}

export interface UserRepository extends BaseRepository<User> {}
