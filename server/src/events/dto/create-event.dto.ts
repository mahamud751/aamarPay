import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The description of the event' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The date of the event (ISO format)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'The location of the event' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ enum: Category, description: 'The category of the event' })
  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;
}
