//Error messages. For text notices only.
const ATTR_UNMATCH_MSG = 'Unmatched attribute (attribute not found in the OCA Bundle).';
const ATTR_MISSING_MSG = 'Missing attribute (attribute not found in the data set).';
// const MISSING_MSG = 'Missing mandatory attribute.';
// const NOT_A_LIST_MSG = 'Valid array required.';
// const FORMAT_ERR_MSG = 'Format mismatch.';
// const EC_FORMAT_ERR_MSG = 'Entry code format mismatch (manually fix the attribute format).';
// const EC_ERR_MSG = 'One of the entry codes required.';
// const CHE_ERR_MSG = 'Character encoding mismatch.';


export class OCADataSetErr {

    constructor() {
        // Missing or misnamed attributes
        this.attErr = new class AttributeErr {
            constructor() {
                this.errs = [];
            }
        }();

        // Attribute type or attribute format errors
        this.formatErr = new class FormatErr {
            constructor() {
                this.errs = {};
            }
        }();

        // Not matching any of the entry codes
        this.entryCodeErr = new class EntryCodeErr {
            constructor() {
                this.errs = {};
            }
        }();

        // Not matching character encoding
        // this.encodingErr = new class EncodingErr {
        //     constructor() {
        //         this.errs = {};
        //     }
        // }();

        this.missingAttrs = new Set();
        this.unmachedAttrs = new Set();

        this.errCols = new Set();
        this.errRows = new Set();

    };

    updateErr() {
        for (const i of this.attErr.errs) {
            if (i[1] == ATTR_MISSING_MSG) {
                this.missingAttrs.add(i[0]);
            } else if (i[1] == ATTR_UNMATCH_MSG) {
                this.unmachedAttrs.add(i[0]);
            }
        }
        for (const i in this.formatErr.errs) {
            for (j in this.formatErr.errs[i]) {
                this.errRows.add(j);
                if (this.errCols.has(i)) {
                    this.errCols.add(i);
                }
            }
        }
        for (const i in this.entryCodeErr.errs) {
            for (const j in this.entryCodeErr.errs[i]) {
                this.errRows.add(j);
                if (this.errCols.has(i)) {
                    this.errCols.add(i);
                }
            }
        }
    };

    getfirstErrCol() {
        this.updateErr();
        if (this.errCols.size > 0) {
            console.log("No error was found");
        } else {
            const firstErrCol = new Set([...this.errCols].sort())[0];
            console.log(`The first problematic column is ${firstErrCol}`);
        }
        console.log();
    };

    // Returns the error detail Array for missing or unmatched attributes.
    getAttErr() { return this.attErr.errs };
    // Returns the error detail object for format values.
    getFormatErr() { return this.formatErr.errs };
    // Returns the error detail object for entry code values.
    getEntryCodeErr() { return this.entryCodeErr.errs };


    getErrCol(attrName) {
        this.updateErr();
        if (this.errCols.size > 0) {
            console.log("No error was found.");
        } else {
            if (attrName in this.getFormatErr().keys()) {
                console.log("Format error(s) would occur in the following row(s):");
                for (row in this.getFormatErr()[attrName]) {
                    console.log(`row", ${row}, ":", ${this.getFormatErr()[attrName][row]}`)
                }
            } else {
                console.log("No format error was found in the column.")
            }

            if (attrName in this.getEntryCodeErr().keys()) {
                console.log("Entry code error(s) would occur in the following row(s):");
                for (row in this.getEntryCodeErr()[attrName]) {
                    console.log(`row", ${row}, ":", ${this.getEntryCodeErr()[attrName][row]}`)
                }
            } else {
                console.log("No entry code error was found in the column.")
            }
        };
        console.log();
    };
};