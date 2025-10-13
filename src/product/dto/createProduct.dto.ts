/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsPositive, IsString } from "@nestjs/class-validator"
import { ApiProperty, } from "@nestjs/swagger"



export class CreateProductDto{

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
  
    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price:number

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description:string

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    cat_id:number
    
}



