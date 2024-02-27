import fs from 'fs';
import OCADataSetErr from './utils/Err';
import { matchFormat } from './utils/matchRules.js';
// The version number of the OCA Technical Specification which this script is
// developed for. See https://oca.colossi.network/specification/
const OCA_VERSION = '1.0';

// Names of OCA bundle dictionary keys.
const CB_KEY = 'capture_base';
const TYPE_KEY = 'type';
const ATTR_KEY = 'attributes';
const FORMAT_KEY = 'format';
const ATTR_FORMAT_KEY = 'attribute_formats';
const CONF_KEY = 'conformance';
const ATTR_CONF_KEY = 'attribute_conformance';
const EC_KEY = 'entry_code';
const ATTR_EC_KEY = 'attribute_entry_codes';
// const CHE_KEY = 'character_encoding';
// const ATTR_CHE_KEY = 'attribute_character_encoding';
// const DEFAULT_ATTR_CHE_KEY = 'default_character_encoding';
// const DEFAULT_ENCODING = 'utf-8';
const FLAG_KEY = 'flagged_attributes';
const OVERLAYS_KEY = 'overlays';


//Error messages. For text notices only.
const ATTR_UNMATCH_MSG = 'Unmatched attribute (attribute not found in the OCA Bundle).';
const ATTR_MISSING_MSG = 'Missing attribute (attribute not found in the data set).';
const MISSING_MSG = 'Missing mandatory attribute.';
const NOT_AN_ARRAY_MSG = 'Valid array required.';
const FORMAT_ERR_MSG = 'Format mismatch.';
const EC_FORMAT_ERR_MSG = 'Entry code format mismatch (manually fix the attribute format).';
const EC_ERR_MSG = 'One of the entry codes required.';
// const CHE_ERR_MSG = 'Character encoding mismatch.';


export default class OCABundle {
    constructor() {
        this.captureBase = null;
        this.overlays = {};
        this.overlays_dict = {};
    };

    /** activate this code when reading file is in the browser.
     * static async readBundle(file) {
        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const bundle = JSON.parse(reader.result);
                    resolve(bundle);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = reject;

            reader.readAsText(file);
        });
    }
    */
    async loadedBundle(file) {
        try {
            const bundle = await OCABundle.readJSON(file);
            this.captureBase = bundle[CB_KEY];  //this needs to be a djusted.
            this.overlays = bundle[OVERLAYS_KEY];
            this.overlays_dict = bundle[CB_KEY];

            for (const overlay in this.overlays) {
                this.overlays_dict[overlay] = this.overlays[overlay];
            }

        } catch (error) {
            console.error("Error loading bundle:", error);
            throw error;
        }

        return this;
    };

    static async readJSON(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const bundle = JSON.parse(data);
                    resolve(bundle);
                } catch (error) {
                    reject(error);
                }
            });
        });
    };

    getOverlay(overlay) {
        if (Object.keys(this.overlays).includes(overlay)) {
            return this.overlays[overlay];
        } else {
            console.error("Overlay not found:", overlay);
        }
    };

    getOverlayVersion(overlay) {
        const overlays = this.getOverlay(overlay);
        if (overlays.length >= 1) {
            return overlays[0][TYPE_KEY].split("/").pop();
        } else {
            return overlays[TYPE_KEY].split("/").pop();
        }
    };

    getAttributes() {
        return this.captureBase[ATTR_KEY];
    };

    getAttributeType(attrName) {
        return this.getAttributes()[attrName];
    };

    getAttributeFormat(attrName) {
        if (this.overlays[FORMAT_KEY][ATTR_FORMAT_KEY][attrName] !== undefined) {
            return this.overlays[FORMAT_KEY][ATTR_FORMAT_KEY][attrName];
        } else {
            return null;
        }
    };

    getAttributeConformance(attrName) {
        if (this.overlays[CONF_KEY][ATTR_CONF_KEY][attrName] !== undefined) {
            return this.overlays[CONF_KEY][ATTR_CONF_KEY][attrName];
        } else {
            return 'O';
        }
    };

    getAttributeEntryCodes(attrName) {
        if (this.overlays[EC_KEY][ATTR_EC_KEY][attrName] !== undefined) {
            return this.overlays[EC_KEY][ATTR_EC_KEY][attrName];
        } else {
            return {};
        }
    };

    // The start validation methods...
    validateAttribute(dataset) { // dataset has to be an instance of OCADataSet.readExcel.
        const rslt = new OCADataSetErr().attErr;
        for (const attrName of Object.keys(dataset)) {
            if (!Object.keys(this.getAttributes()).includes(attrName)) {
                rslt.errs.push([attrName, ATTR_UNMATCH_MSG]);
            }
        }
        return rslt.errs;
    };

    // Validates all attributes for format values.
    // Also checks for any missing mandatory attributes.
    validateFormat(dataset) {
        const rslt = new OCADataSetErr().formatErr;

        for (const attr in this.getAttributes()) {
            rslt.errs[attr] = {};
            const attrType = this.getAttributeType(attr);
            const attrFormat = this.getAttributeFormat(attr);
            const attrConformance = this.getAttributeConformance(attr);

            try {

                // check if the attr is missing in the dataset then add the missing message. and continue to the next attribute.

                for (let i=0; i < dataset[attr].length; i++) {
                    const dataEntry = String(dataset[attr][i]);
                    if (dataEntry === undefined || dataEntry === null && attrConformance === 'M') {
                        rslt.errs[attr][i] = MISSING_MSG;
                    } else if (dataEntry === undefined || dataEntry === null && attrConformance === 'O') {
                        dataEntry = '';
                    }
                    if (attrType.includes('Array')) {

                            let dataArr;
                            try {
                                dataArr = JSON.parse(dataEntry);

                            } catch (error) {
                                // Not a valid JSON format string.
                                rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                                continue;
                            };
                            if (!Array.isArray(dataEntry)) {
                                // Not a valid JSON array.
                                rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                                continue;
                            };
                            for (const j = 0; j < dataArr.length; j++) {
                                if (!matchFormat(attrType, attrFormat, String(dataArr[j]))) {
                                    rslt.errs[attr][i] = `${FORMAT_ERR_MSG} Supported format: ${attrFormat}.`;
                                    break;
                                }
                            }
                        } else if (!matchFormat(attrType, attrFormat, dataEntry)) {
                            if (this.getAttributeEntryCodes(attr).length > 0) {
                                rslt.errs[attr][i] = `${EC_FORMAT_ERR_MSG} Supported format for entry code is: ${attrFormat}.`;
                            } else {
                                // Non-array attributes and other format mismatches.
                                rslt.errs[attr][i] = `${FORMAT_ERR_MSG} Supported format: ${attrFormat}.`;
                            }
                        } else {
                            ;
                        }
                    }
            } catch (error) {
                continue;
                // console.log("Error in validateFormat:")
                // console.error(error);
            }
        }
        return rslt.errs;
    };

    validateEntryCodes(dataset, attrName) {
        const rslt = new OCADataSetErr().entryCodeErr;
        const attrEntryCodes = this.getAttributeEntryCodes(attrName);
        rslt.errs[attrName] = {};

        for (let i = 0; i < dataset[attrName].length; i++) {
            const entry = dataset[attrName][i];
            if (!attrEntryCodes.includes(entry)) {

                rslt.errs[attrName][i] = `${EC_ERR_MSG} Entry codes allowed: ${attrEntryCodes}`;
            }
        };
        return rslt.errs;
    };

    flaggedAlarm() {
        if (Object.keys(this.captureBase).includes(FLAG_KEY) && this.captureBase.flagged_attributes.length > 0) {
            console.log("Contains flagged data. Please check the following attribute(s):")
            for (attr in this.captureBase.flagged_attributes) {
                console.log(attr);
            }
        }
        return this.captureBase.flagged_attributes;
    };

    versionAlarm() {
        let versionError = false;
        for (const overlay of (Object.keys(this.overlays))) {
            const fileVer = this.getOverlayVersion(overlay);
            if (fileVer && fileVer !== OCA_VERSION) {
                versionError = true;
                console.error(`Warning: overlay ${overlay} has a different OCA specification version: ${fileVer}.`);
            }
        }
        if (versionError) {
            return `Warning: The OCA bundle has a different OCA specification version: ${OCA_VERSION}.`;
        } else {
            return "";
        }
    };

    validate(dataset) {
        const rslt = new OCADataSetErr();
        rslt.attErr.errs = this.validateAttribute(dataset);
        rslt.formatErr.errs = this.validateFormat(dataset);
        // rslt.entryCodeErr.errs = this.validateEntryCodes(dataset); // need to do a for loop to adjust which attribute has entry codes.
        return rslt;
    }
};