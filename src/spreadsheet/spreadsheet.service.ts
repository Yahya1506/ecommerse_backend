/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {google} from 'googleapis'


@Injectable()
export class SpreadsheetService {
    private sheets;
    private spreadsheetId = process.env.Googlesheet_Id;

    constructor(){
        const auth = new google.auth.GoogleAuth({
        keyFile: 'src/config/keys/sheet-service-account.json', 
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({version:'v4', auth});
    }

    async rowNumber(id:number){
        const res = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range:'Sheet1!A:A',
        })
        const ids = res.data.values;
        console.log(ids)
        for (const i in ids){
            if( ids[i][0] == id){
                return Number(i)+1;
            }
        }
    }

    async updateRow(id: number, values:any[]){
        const rowNum = await this.rowNumber(id);
        console.log(rowNum);
        const res = await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range:`Sheet1!A${rowNum}:F${rowNum}`,
            valueInputOption:'USER_ENTERED',
            requestBody:{
                values:[values]
            }
        });

        return {res}
    }

    async addRow(values:any[]){
        const res = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range:'Sheet1!A:F',
            valueInputOption:'USER_ENTERED',
            requestBody:{
                values:[values]
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return res
    }


}
