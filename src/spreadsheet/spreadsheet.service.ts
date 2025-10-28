/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {google} from 'googleapis'


@Injectable()
export class SpreadsheetService {
    private sheets;
    private spreadsheetId = process.env.Googlesheet_Id;
    private readonly logger = new Logger(SpreadsheetService.name);

    constructor(){
        const auth = new google.auth.GoogleAuth({
        keyFile: 'src/config/keys/sheet-service-account.json', 
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({version:'v4', auth});
    }

    /* ---------- Helper: Find row number by ID ---------- */
  async findRowNumberById(id: number): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:A',
      });

      const rows = response.data.values ?? [];
      const rowIndex = rows.findIndex((row) => String(row[0]) === String(id));

      if (rowIndex === -1) {
        throw new NotFoundException(`Row with ID ${id} not found.`);
      }

      return rowIndex + 1; // Adjust for 1-based sheet index
    } catch (error) {
      this.logger.error(`Failed to locate row with ID ${id}`, error.stack);
      throw new InternalServerErrorException('Error retrieving row from Google Sheet.');
    }
  }

  /* ---------- Update an existing row ---------- */
  async updateRow(id: number, values: any[]): Promise<{ message: string }> {
    try {
      const rowNumber = await this.findRowNumberById(id);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Sheet1!A${rowNumber}:F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });

      return { message: `Row with ID ${id} updated successfully.` };
    } catch (error) {
      this.logger.error(`Failed to update row with ID ${id}`, error.stack);
      throw new InternalServerErrorException('Error updating Google Sheet row.');
    }
  }

  /* ---------- Append a new row ---------- */
  async appendRow(values: any[]): Promise<{ message: string }> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Sheet1!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });

      return { message: 'New row added successfully.' };
    } catch (error) {
      this.logger.error('Failed to append row to Google Sheet', error.stack);
      throw new InternalServerErrorException('Error adding new row to Google Sheet.');
    }
  }
}
