/* eslint-disable @typescript-eslint/brace-style */
import { User } from '@src/models/User';
import { DefaultMongoDBRepository } from '@src/repositories/defaultMongoDBRepository';
import { UserRepository } from '@src/repositories';

export class UserMongoDBRepository
  extends DefaultMongoDBRepository<User>
  implements UserRepository
{
  constructor(private readonly userModel = User) {
    super(userModel);
  }
}
