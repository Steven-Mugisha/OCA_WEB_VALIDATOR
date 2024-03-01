//Error messages. For text notices only.
const ATTR_UNMATCH_MSG = 'Unmatched attribute (attribute not found in the OCA Bundle).';
const ATTR_MISSING_MSG = 'Missing attribute (attribute not found in the data set).';

// Missing or misnamed attributes
class AttributeErr {
    constructor() {
        this.errs = [];
    }
};

// Attribute type or attribute format errors
class FormatErr {
    constructor() {
        this.errs = {};
    }
};

// Not matching any of the entry codes
class EntryCodeErr {
    constructor() {
        this.errs = {};
    }
};

export default class OCADataSetErr {

    constructor() {
        this.attErr = new AttributeErr();
        this.formatErr = new FormatErr();
        this.entryCodeErr = new EntryCodeErr();

        this.missingAttrs = new Set();
        this.unmachedAttrs = new Set();

        this.errCols = new Set();
        this.errRows = new Set();
    };

    getfirstErrCol() {
        this.updateErr();
        if (this.errCols.size > 0) {
            const firstErrCol = [...this.errCols].sort()[0];
            // console.log(`The first problematic column is ${firstErrCol}`);
            return firstErrCol;
        } else {
            // console.log("No error was found");
            return null;
        }
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
            for (const j in this.formatErr.errs[i]) {
                this.errRows.add(j); // problematic row
                if (Object.keys(this.formatErr.errs).includes(i)) {
                this.errCols.add(i); // problematic column
            }
        }
    }
        for (const i in this.entryCodeErr.errs) {
            for (const j in this.entryCodeErr.errs[i]) {
                this.errRows.add(j);
                if (Object.keys(this.entryCodeErr.errs).includes(i)) {
                    this.errCols.add(i);
                }
            }
        }
        return this;
    };

    // Returns the error detail Array for missing or unmatched attributes.
    getAttErr() { return this.attErr.errs };
    // Returns the error detail object for format values.
    getFormatErr() { return this.formatErr.errs };
    // Returns the error detail object for entry code values.
    getEntryCodeErr() { return this.entryCodeErr.errs };

    getErrCol(attrName) {
        this.errRows.clear();
        if (!Array.from(this.errCols).includes(attrName)) {
            // console.log("No error was found.");
            return null;
        } else {
            if (Object.keys(this.getFormatErr()).includes(attrName)) {
                // console.log("Format error(s) would occur in the following row(s):");

                for (const row in this.getFormatErr()[attrName]) {
                    // console.log(`row", ${row}, ":", ${this.getFormatErr()[attrName][row]}`)
                    this.errRows.add(row);
                }
            } else {
                // console.log("No format error was found in the column.")
                return null;
            }
            if (attrName in Object.keys(this.getEntryCodeErr())) {
                console.log("Entry code error(s) would occur in the following row(s):");
                for (row in this.getEntryCodeErr()[attrName]) {
                    console.log(`row", ${row}, ":", ${this.getEntryCodeErr()[attrName][row]}`)
                }
            } else {
                // console.log("No entry code error was found in the column.")
                ;
            }
        };
        return this.errRows;
    };
};
