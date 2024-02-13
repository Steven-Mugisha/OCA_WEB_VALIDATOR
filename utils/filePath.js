const fs = require('fs').promises;
const path = require('path');

const directoryPath = './uploads/';

async function getFileUploadPath() {
    try {
        const files = await fs.readdir(directoryPath);

        // Filter files with .json extension
        const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

        if (jsonFiles.length === 0) {
            console.log('No JSON files found in the directory.');
            return null;
        }

        const filename = jsonFiles[0];
        const filePath = path.join(directoryPath, filename);
        console.log('File path:', filePath);

        return filePath;
    } catch (err) {
        console.error('Error reading directory:', err);
        return null;
    }
}

export default getFileUploadPath;
