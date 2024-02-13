import express from "express";
import multer from "multer";
import validatorController from "../controllers/validatorController.js";
import path from "path";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, `${'./uploads'}`);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        const sanitizedFilename = file.originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        file.originalExt = path.extname(file.originalname);
        file.sanitizedFilename = sanitizedFilename;
        const filename = `${sanitizedFilename}-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);

    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const { uploadType } = req.body;
    const ext = path.extname(file.originalname);

    switch (uploadType) {
        case 'bundle':
            if (ext === '.json') {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only .json files are allowed.'), false);
            }
            break;
        case 'dataset':
            if (['.xlsx', '.xls', '.csv'].includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only .xlsx, .xls, .csv files are allowed.'), false);
            }
            break;
        default:
            cb(new Error('Invalid upload type'), false);
    }
};


// Multer upload
const upload = multer({ storage, fileFilter });

router.get("/", validatorController.mainPage);
router.post("/upload-dataset", upload.single('datasetFile'), validatorController.uploadDatasets);

export default router;