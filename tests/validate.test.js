import OCADataSetErr from '../lib/utils/Err.js';
import OCADataSet from '../lib/utils/files';
import OCABundle from '../lib/validator.js';
import path from 'path';

describe('OCABundle', () => {
    it('should return OCADataSetErr object with all errors corrected.', async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(path.join(__dirname, 'datasets', 'oca_bundle.json'));
        // Tesing xls data entry file.
        const dataset = await OCADataSet.readExcel(path.join(__dirname, 'datasets', 'data_entry.xlsx'));
        // await dataset.loadDataset(path.join(__dirname, 'datasets', 'data_entry.xlsx'));
        // Testing csv data entry file.
        // const dataset = await OCADataSet.readCSV(path.join(__dirname, 'datasets', 'data_set.csv'));
        const validate = bundle.validate(dataset);
        console.log(validate.errCollection['0']);
        // console.log(bundle);

        /**
         *   OCADataSetErr {
                attErr: AttributeErr {
                    errs: [ [Array], [Array], [Array], [Array], [Array] ]
                },
                formatErr: FormatErr {
                    errs: {
                    Age: {},
                    BreastWt: {},
                    Breed: [Object],
                    Farm: {},
                    Glucose: [Object],
                    Lipase: {},
                    LiveWt: {}
                    }
                },
                entryCodeErr: EntryCodeErr { errs: { Breed: [Object] } },
                missingAttrs: Set(2) { 'Lipase', 'LiveWt' },
                unmachedAttrs: Set(3) { 'WtLive', 'coseGlu', 'Famr' },
                errCols: Set(2) { 'Breed', 'Glucose' },
                errRows: Set(3) { '1', '6', '0' },
                errCollection: {
                    '0': { Glucose: 'Format mismatch. Supported format: [A-Z0-9]{9}.' },
                    '1': {
                    Breed: 'One of the entry codes required. Entry codes allowed: [B,S]'
                    },
                    '6': {
                    Breed: 'One of the entry codes required. Entry codes allowed: [B,S]',
                    Glucose: 'Format mismatch. Supported format: [A-Z0-9]{9}.'
                    }
                }`
            }
         */
        expect(validate).toBeInstanceOf(OCADataSetErr);
    });
});
