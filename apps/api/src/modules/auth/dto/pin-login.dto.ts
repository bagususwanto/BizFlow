import { IsNotEmpty, IsString, Length } from 'class-validator';

export class PinLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID wajib diisi' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'PIN wajib diisi' })
  @Length(4, 6, { message: 'PIN harus 4-6 digit' })
  pin: string;
}
