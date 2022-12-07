/* eslint-disable @typescript-eslint/brace-style */
import { Beach } from '@src/models/Beach';
import { DefaultMongoDBRepository } from '@src/repositories/defaultMongoDBRepository';
import { BeachRepository, WithId } from '@src/repositories';

export class BeachMongoDBRepository
  extends DefaultMongoDBRepository<Beach>
  implements BeachRepository
{
  constructor(private readonly beachModel = Beach) {
    super(beachModel);
  }

  public async findAllBeachesForUser(
    userId: string
  ): Promise<Array<WithId<Beach>>> {
    return await this.find({ user: userId });
  }
}
