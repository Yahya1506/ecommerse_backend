/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsPositive, IsString } from "@nestjs/class-validator"
import { ApiProperty, } from "@nestjs/swagger"



export class CreateProductDto{

    @ApiProperty({example:'samsung galaxy a15'})
    @IsNotEmpty()
    @IsString()
    name: string
  
    @ApiProperty({example:'50000'})
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



