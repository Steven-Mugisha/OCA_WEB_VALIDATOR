import { spawn } from 'child_process';
import fs from 'fs';

const mainPage = (_req, res) => {
    res.send("Welcome to the validator service!");
};

const uploadDatasets = (req, res) => {
    try {
        // const { uploadType } = req.body;
        // const { filename } = req.file;

        // get the bundle path from the ./uploads folder look for the file with .json extension if it exists else return an error and say please upload a bundle file
        // const bundlePath = files.filter


        // get the dataset path from the ./uploads folder look for the file with .xlsx, .xls, .csv extension if it exists else return an error and say please upload a dataset file

        const process = spawn('python3', ['./src/validator.py', ]);

        process.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        process.stderr.on('data', (data) => {
            console.log(data.toString());
        });

        process.on('exit', (code) => {
            console.log(`Child process exited with code ${code}`);
        });

        res.status(200).json({ message: 'Upload successful!', uploadType, filename });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload failed!', error: error.message });
    }

    // res.status(200).json({ message: 'Upload successful!', uploadType, filename: req.file.filename });
};

export default {
    uploadDatasets,
    mainPage
};