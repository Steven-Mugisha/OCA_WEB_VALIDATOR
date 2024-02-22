import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export class OCADataSet {
    static async readDataset(file) {
        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {
                const fileType = OCADataSet.getFileType(file.name);

                let result;
                switch (fileType) {
                    case 'xlsx':
                        result = OCADataSet.readExcel(reader.result);
                        break;
                    case 'csv':
                        result = OCADataSet.readCSV(reader.result);
                        break;
                    default:
                        reject(new Error('Invalid file type'));
                        return;
                }

                resolve(result);
            };

            reader.onerror = reject;

            reader.readAsBinaryString(file);
        });
    }

    static getFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'xlsx' || ext === 'xls') {
            return 'xlsx';
        } else if (ext === 'csv') {
            return 'csv';
        } else {
            throw new Error('Invalid file type');
        }
    }

    static async readExcel(fileContent) {
        return new Promise((resolve, reject) => {
            try {
                const workbook = XLSX.readFile(fileContent);
                const sheetName = 'Schema conformant data';
                const dataset = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    blankrows: false
                }).filter(entry => Object.values(entry).some(value => value !== ""));

                resolve(dataset);

            } catch (error) {
                reject(error);
            }
        });
    }

    static readCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                complete: (result) => {
                    resolve(result.data);
                },
                error: reject
            });
        });
    }
};