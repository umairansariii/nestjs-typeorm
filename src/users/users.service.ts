import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const profile = new Profile({
      ...createUserDto.profile,
    });
    const user = new User({
      ...createUserDto,
      profile,
    });

    await this.entityManager.save(user);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: { profile: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;

    await this.entityManager.save(user);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }
}
