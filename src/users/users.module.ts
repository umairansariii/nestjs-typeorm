import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Review } from './entities/review.entity';
import { Interest } from './entities/interest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Review, Interest])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
