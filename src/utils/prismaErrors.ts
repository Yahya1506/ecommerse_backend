/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

export function handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
        case 'P2000':
        throw new BadRequestException('Input value is too long for this field.');
        case 'P2002':
            throw new ConflictException('Duplicate record detected (unique constraint violation).');
        case 'P2003':
            throw new BadRequestException('Foreign key constraint failed. Related record not found.');
        case 'P2004':
            throw new BadRequestException('Constraint failed on the database field.');
        case 'P2005':
            throw new BadRequestException('Invalid value provided for a field.');
        case 'P2006':
            throw new BadRequestException('Invalid data type for a field.');
        case 'P2007':
            throw new BadRequestException('Data validation error.');
        case 'P2011':
            throw new BadRequestException('Null constraint violation — field cannot be null.');
        case 'P2014':
            throw new BadRequestException('Invalid nested relation detected.');
        case 'P2016':
            throw new NotFoundException('Query interpretation error. Record may not exist.');
        case 'P2017':
            throw new BadRequestException('Relation record between entities not found.');
        case 'P2021':
            throw new InternalServerErrorException('Database table does not exist.');
        case 'P2022':
            throw new InternalServerErrorException('Database column does not exist.');
        case 'P2025':
            throw new NotFoundException('Record not found in the database.');
        case 'P2033':
            throw new BadRequestException('Number out of range for the column type.');
        case 'P2036':
            throw new BadRequestException('Unsupported feature or incorrect query syntax.');
        default:
            throw new InternalServerErrorException(`Database error (code: ${error.code}).`);
        }
    }
    throw new InternalServerErrorException('An unexpected error occurred.');
}