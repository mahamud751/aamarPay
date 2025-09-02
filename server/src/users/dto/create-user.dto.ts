// backend/src/users/dto/create-user.dto.ts
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoDto } from 'src/dto/photoDto';
import { Type } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';
import { IsBangladeshPhoneNumber } from './phone-number-validation';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'The phone number of the user' })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.phone && o.provider !== 'google') // Skip for Google users
  @IsBangladeshPhoneNumber({ message: 'Invalid Bangladesh phone number.' })
  phone?: string;

  @ApiPropertyOptional({ description: 'The password of the user' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Array of photo objects',
    type: [PhotoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  @IsOptional()
  photos?: PhotoDto[];

  @ApiPropertyOptional({ description: 'The address of the user' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'The branch of the user' })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({
    description: 'The status of the user',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Array of advance IDs associated with the user',
    type: [String],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  advances?: string[];

  @ApiPropertyOptional({
    description: 'The authentication provider (e.g., google)',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'The provider-specific user ID' })
  @IsString()
  @IsOptional()
  providerId?: string;
}
