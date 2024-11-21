import { CreateProfileDto } from './create-profile.dto';

export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profile: CreateProfileDto;
}
