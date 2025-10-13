/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CatagoryDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cat_name:string
}