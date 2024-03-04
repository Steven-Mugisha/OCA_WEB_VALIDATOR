import OCADataSetErr from '../lib/utils/Err';
import OCADataSet from '../lib/utils/files';
import OCABundle from '../lib/validator.js';
import path from 'path';

describe('OCABundle', () => {
    it('should return OCADataSetErr object with all errors corrected.', async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(path.join(__dirname, 'datasets', 'oca_bundle.json'));
        const dataset = await OCADataSet.readExcel(path.join(__dirname, 'datasets', 'err_data_entry.xlsx'));
        const validate = bundle.validate(dataset);

        /**
         * The following logging statements can be used for debugging purposes.
         *
         * console.log(validate);
         * console.log(validate.attErr);
         * console.log(validate.formatErr);
         * console.log(validate.entryCodeErr);
         * console.log(validate.getErrCol("Age"));
         * console.log(validate.getfirstErrCol());
         * console.log(validate.getErrCol("Breed"));
         * console.log(validate.missingAttrs);
         * console.log(validate.unmachedAttrs);
         *
         *
         * Example of the expect output object for the err_data_entry.xlsx.
         *
         * OCADataSetErr {
         *    attErr: AttributeErr {
         *        errs: [ [Array], [Array], [Array], [Array], [Array] ]
         *    },
         *    formatErr: FormatErr {
         *        errs: {
         *        Age: [Object],
         *        BreastWt: {},
         *        Breed: [Object],
         *        Farm: [Object],
         *        Glucose: [Object],
         *        Lipase: {},
         *        LiveWt: {}
         *        }
         *    },
         *    entryCodeErr: EntryCodeErr { errs: { Breed: [Object] } },
         *    missingAttrs: Set(2) { 'Lipase', 'LiveWt' },
         *    unmachedAttrs: Set(3) { 'WtLive', 'coseGlu', 'Famr' },
         *    errCols: Set(4) { 'Age', 'Breed', 'Farm', 'Glucose' },
         *    errRows: Set(5) { '1', '2', '3', '4', '0' }
         * }
         */

        expect(validate).toBeInstanceOf(OCADataSetErr);
    });
});
