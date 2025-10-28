/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CatagoryDto } from './dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CatagoryService } from './catagory.service';
import { HttpExceptionFilter } from 'src/filters/http-exception/http-exception.filter';

@UseFilters(HttpExceptionFilter)
@Controller('catagories')
export class CatagoryController {
    constructor(private catagory:CatagoryService){}

    @Get()
    async getCatagories(){
        return await this.catagory.getCatagories();
    }

    //@UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post()
    @ApiBody({type:CatagoryDto})
    async createCatagory(@Body() catagory:CatagoryDto){
        return await this.catagory.createCatagory(catagory);
    }


    //@UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Put(':id')
    @ApiBody({type:CatagoryDto})
    async updateCatagories(@Body() catagory:CatagoryDto, @Param('id',ParseIntPipe) id: number){
        return await this.catagory.updateCatagory(catagory,id)
    }


    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Delete(':id')
    async deleteCatagories(@Param('id',ParseIntPipe) id: number){
        return await this.catagory.deleteCatagory(id);
    }
}
