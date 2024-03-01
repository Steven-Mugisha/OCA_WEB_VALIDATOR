import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default class OCADataSet {
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
                const worksheet = workbook.Sheets[sheetName];
                const range = XLSX.utils.decode_range(worksheet['!ref']);

                let lastRowIndex = range.s.r;

                for (let row = range.s.r; row <= range.e.r; row++) {
                    let isRowEmpty = true;
                    for (let col = range.s.c; col <= range.e.c; col++) {
                        const cellAddress = { c: col, r: row };
                        const cellRef = XLSX.utils.encode_cell(cellAddress);
                        const cell = worksheet[cellRef];
                        if (cell && cell.v !== undefined && cell.v !== '') {
                            isRowEmpty = false;
                            lastRowIndex = row;
                            break;
                        }
                    }
                }

                const dataset = XLSX.utils.sheet_to_json(worksheet, {
                    range: 0,
                    header: 1,
                    blankrows: true,
                    raw: false,
                    defval: ''
                });

                const result = {};
                for (let col = 0; col < dataset[0].length; col++) {
                    const columnName = dataset[0][col];
                    result[columnName] = dataset.slice(1, lastRowIndex + 1).map(row => row[col]);
                }

                resolve(result);

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