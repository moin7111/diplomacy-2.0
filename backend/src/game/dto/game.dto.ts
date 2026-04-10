import { IsNotEmpty, IsObject, IsString, Length, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ example: 'My Epic Match' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: { rockets: true, timer: 10 } })
  @IsObject()
  config: any;
}

export class JoinGameDto {
  @ApiProperty({ example: 'A7X9K2' })
  @IsString()
  @Length(6, 6)
  room_code: string;
}

export const ALLOWED_NATIONS = [
  'Großbritannien',
  'Deutsches Reich',
  'Österreich-Ungarn',
  'Frankreich',
  'Italien',
  'Russland',
  'Osmanisches Reich'
];

export class ChooseNationDto {
  @ApiProperty({ example: 'Deutsches Reich' })
  @IsString()
  @IsIn(ALLOWED_NATIONS)
  nation: string;
}
