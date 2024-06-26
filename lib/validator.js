import fs from 'fs';
import AdmZip from 'adm-zip';
import OCADataSetErr from './utils/Err';
import { matchFormat, matchCharacterEncoding } from './utils/matchRules';

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
const CHE_KEY = 'character_encoding';
const ATTR_CHE_KEY = 'attribute_character_encoding';
const DEFAULT_ATTR_CHE_KEY = 'default_character_encoding';
const DEFAULT_ENCODING = 'utf-8';
const FLAG_KEY = 'flagged_attributes';
const OVERLAYS_KEY = 'overlays';

// Error messages. For text notices only.
const ATTR_UNMATCH_MSG = 'Unmatched attribute (attribute not found in the OCA Bundle).';
const ATTR_MISSING_MSG = 'Missing attribute (attribute not found in the data set).';
const MISSING_MSG = 'Missing an entry for a mandatory attribute (check for other missing entries before continuing).';
// const NOT_AN_ARRAY_MSG = 'Valid array required.';
const FORMAT_ERR_MSG = 'Format mismatch.';
const EC_FORMAT_ERR_MSG = 'Entry code format mismatch (manually fix the attribute format).';
const EC_ERR_MSG = 'One of the entry codes is required.';
const CHE_ERR_MSG = 'Character encoding mismatch.';

export default class OCABundle {
    constructor () {
        this.captureBase = null;
        this.overlays = {};
        // this.overlays_dict = {};
    };

    // Load the OCA bundle from a JSON file.
    async loadedBundle (file) {
        try {
            let bundle;
            // read the zip file.
            if (file.endsWith('.zip')) {
                bundle = await OCABundle.readZip(file);
            } else {
                const rawBundle = await OCABundle.readJSON(file);
                bundle = rawBundle.bundle || rawBundle;
            }

            this.captureBase = bundle[CB_KEY];
            this.overlays = bundle[OVERLAYS_KEY];
            // this.overlays_dict = bundle[CB_KEY];

            // for (const overlay in this.overlays) {
            //     this.overlays_dict[overlay] = this.overlays[overlay];
            // }
        } catch (error) {
            console.error('Error loading bundle:', error);
            throw error;
        }

        return this;
    };

    static async readJSON (file) {
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

    // Construct the OCA bundle from a zip file.
    // Overlays of interest: (format, character encoding, conformance, entry codes).
    static async readZip (file) {
        return new Promise((resolve, reject) => {
            try {
                const zip = new AdmZip(file);
                const zipOverlays = zip.getEntries();
                const bundle = {};
                const overlaysObjectFromZip = {};
                const neededOverlays = [FORMAT_KEY, CHE_KEY, CONF_KEY, EC_KEY];

                // Grab the capture base from the zip file.
                for (const zipOverlay of zipOverlays) {
                    if (zipOverlay.entryName.includes('.json')) {
                        const overlay = JSON.parse(zip.readAsText(zipOverlay));
                        if (TYPE_KEY in overlay && overlay[TYPE_KEY].split('/')[1] === 'capture_base') {
                            bundle[CB_KEY] = overlay;
                        }
                    }
                }

                for (const zipOverlay of zipOverlays) {
                    if (zipOverlay.entryName.includes('.json')) {
                        const overlay = JSON.parse(zip.readAsText(zipOverlay));
                        if (TYPE_KEY in overlay && neededOverlays.includes(overlay[TYPE_KEY].split('/')[2])) {
                            overlaysObjectFromZip[overlay[TYPE_KEY].split('/')[2]] = overlay;
                        }
                    }
                }

                bundle.overlays = overlaysObjectFromZip;
                resolve(bundle);
            } catch (error) {
                reject(error);
            }
        });
    };

    static getOverlay (overlay) {
        if (Object.keys(this.overlays).includes(overlay)) {
            return this.overlays[overlay];
        } else {
            console.error('overlay not found:', overlay);
        }
    };

    static getOverlayVersion (overlay) {
        const overlays = this.getOverlay(overlay);
        if (overlays.length >= 1) {
            return overlays[0][TYPE_KEY].split('/').pop();
        } else {
            return overlays[TYPE_KEY].split('/').pop();
        }
    };

    getAttributes () {
        return this.captureBase[ATTR_KEY];
    };

    getAttributeType (attrName) {
        return this.getAttributes()[attrName];
    };

    getAttributeFormat (attrName) {
        const formatKey = this.overlays[FORMAT_KEY];
        const attrFormatKey = formatKey && formatKey[ATTR_FORMAT_KEY];

        if (attrFormatKey && attrFormatKey[attrName] !== undefined) {
            return attrFormatKey[attrName];
        }
        return null;
    };

    getAttributeConformance (attrName) {
        const confKey = this.overlays[CONF_KEY];
        const attrConfKey = confKey && confKey[ATTR_CONF_KEY];

        if (attrConfKey && attrConfKey[attrName] !== undefined) {
            return attrConfKey[attrName];
        } else {
            return 'O';
        }
    };

    getEntryCodes () {
        try {
            return this.overlays[EC_KEY][ATTR_EC_KEY];
        } catch (error) {
            return {};
        }
    };

    getCharacterEncoding (attrName) {
        const cheKey = this.overlays[CHE_KEY];
        const attrCheKey = cheKey && cheKey[ATTR_CHE_KEY];
        const defaultCheKey = cheKey && cheKey[DEFAULT_ATTR_CHE_KEY];

        if (attrCheKey && attrCheKey[attrName] !== undefined) {
            return attrCheKey[attrName];
        } else {
            return defaultCheKey || DEFAULT_ENCODING;
        }
    };

    // The start validation methods...
    /**
     * Validates all attributes for existence in the OCA Bundle.
     * @param {*} dataset - The dataset to is the instance of the OCADataSet class (xlsx or csv file).
     * @returns {Array} - An array of unmatched attributes / missing attributes.
     */
    validateAttribute (dataset) {
        const rslt = new OCADataSetErr().attErr;
        for (const attrName of Object.keys(dataset)) {
            if (!Object.keys(this.getAttributes()).includes(attrName)) {
                rslt.errs.push([attrName, ATTR_UNMATCH_MSG]);
            }
        }

        for (const attrName of Object.keys(this.getAttributes())) {
            if (!Object.keys(dataset).includes(attrName)) {
                rslt.errs.push([attrName, ATTR_MISSING_MSG]);
            }
        }

        return rslt.errs;
    };

    /** Validates all attributes for format values.
     * Also checks for any missing mandatory attributes.
     * @param {*} dataset - The dataset to is the instance of the OCADataSet class (xlsx or csv file).
     * @returns {Object} - An object of format errors. Example: {attr1: {0: "Format mismatch."}, attr2: {1: "Missing mandatory attribute."}}
    */
    validateFormat (dataset) {
        const rslt = new OCADataSetErr().formatErr;

        for (const attr in this.getAttributes()) {
            rslt.errs[attr] = {};
            const attrType = this.getAttributeType(attr);
            const attrFormat = this.getAttributeFormat(attr);
            const attrConformance = this.getAttributeConformance(attr);

            try {
                // Verifying the missing data entries for a mandatory (required) attributes.
                for (let i = 0; i < dataset[attr].length; i++) {
                    let dataEntry = String(dataset[attr][i]);

                    if ((dataEntry === undefined || dataEntry === null || dataEntry === '') && attrConformance === 'O') {
                        dataEntry = '';
                    }

                    // Verifying data types for entries to match the attribute's.
                    if (attrType.includes('Array')) {
                        continue;

                        // Todo: Implement array data type validation.
                        // let dataArr;
                        // try {
                        //     const arrRegex = /^\[.*\]$/;

                        //     if (!arrRegex.test(dataEntry)) {
                        //         rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                        //         continue;
                        //     }
                        //     // if (arrRegex.test(dataEntry)) {
                        //     //     dataArr = JSON.parse(dataEntry); // Convert a string to an array.
                        //     // } else {
                        //     //     rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                        //     //     continue;
                        //     // }
                        // } catch (error) {
                        //     // Not a valid JSON format string.
                        //     rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                        //     continue;
                        // };
                        // if (!Array.isArray(dataEntry)) {
                        //     // Not a valid JSON array.
                        //     rslt.errs[attr][i] = NOT_AN_ARRAY_MSG;
                        //     continue;
                        // };
                        // for (let j = 0; j < dataArr.length; j++) {
                        //     if (!matchFormat(attrType, attrFormat, String(dataArr[j]))) {
                        //         rslt.errs[attr][i] = `${FORMAT_ERR_MSG} Supported format: ${attrFormat}.`;
                        //         break;
                        //     }n
                        // }
                    } else if (!matchFormat(attrType, attrFormat, dataEntry)) {
                        if (dataEntry === '' && attrConformance === 'O') {
                            continue;
                        } else if (dataEntry === '' && attrConformance === 'M') {
                            rslt.errs[attr][i] = { type: 'FE', detail: `${MISSING_MSG} Supported format: ${attrFormat}.` };
                        } else {
                            if (attrType.includes('Boolean')) {
                                rslt.errs[attr][i] = { type: 'FE', detail: `${FORMAT_ERR_MSG} Supported format: ['True','true','TRUE','T','1','1.0','False','false','FALSE','F','0','0.0']` };
                            } else {
                                if (attrFormat == null) {
                                    rslt.errs[attr][i] = { type: 'FE', detail: `${FORMAT_ERR_MSG} Supported format: ${attrType}.` };
                                } else {
                                    rslt.errs[attr][i] = { type: 'FE', detail: `${FORMAT_ERR_MSG} Supported format: ${attrFormat}.` };
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                ;
            }
        }
        return rslt.errs;
    };

    validateEntryCodes (dataset) {
        const rslt = new OCADataSetErr().entryCodeErr;
        const attrEntryCodes = this.getEntryCodes();
        for (const attr in attrEntryCodes) {
            rslt.errs[attr] = {};
            for (let i = 0; i < dataset[attr].length; i++) {
                const dataEntry = dataset[attr][i];
                if (!attrEntryCodes[attr].includes(dataEntry) && dataEntry !== '' && dataEntry !== undefined) {
                    rslt.errs[attr][i] = { type: 'EC', detail: `${EC_ERR_MSG} Entry codes allowed: [${Object.values(attrEntryCodes)}]` };
                }
            }
        }
        return rslt.errs;
    };

    validateCharacterEncoding (dataset) {
        const rslt = new OCADataSetErr().characterEcodeErr;
        for (const attr in this.getAttributes()) {
            rslt.errs[attr] = {};
            const attrChe = this.getCharacterEncoding(attr);
            for (let i = 0; i < dataset[attr].length; i++) {
                const dataEntry = dataset[attr][i];
                // console.log('initial', dataEntry);
                if (!matchCharacterEncoding(dataEntry, attrChe)) {
                    rslt.errs[attr][i] = { type: 'CHE', detail: CHE_ERR_MSG };
                }
            }
        }
        return rslt.errs;
    }

    flaggedAlarm () {
        const flagged = [];
        if (Object.keys(this.captureBase).includes(FLAG_KEY) && this.captureBase.flagged_attributes.length > 0) {
            for (const attr in this.captureBase.flagged_attributes) {
                flagged.push(attr);
            }
        }

        return flagged;
    };

    versionAlarm () {
        let versionError = false;
        let errorMessage = '';

        for (const overlay of Object.keys(this.overlays)) {
            const fileVer = this.getOverlayVersion(overlay);
            if (fileVer && fileVer !== OCA_VERSION) {
                versionError = true;
                errorMessage = `Warning: overlay ${overlay} has a different OCA specification version: ${fileVer}.`;
                break;
            }
        }

        if (versionError) {
            errorMessage += ` Warning: The OCA bundle has a different OCA specification version: ${OCA_VERSION}.`;
        }

        return { isError: versionError, message: errorMessage };
    };

    validate (dataset) {
        const rslt = new OCADataSetErr();
        rslt.attErr.errs = this.validateAttribute(dataset);
        rslt.formatErr.errs = this.validateFormat(dataset);
        rslt.entryCodeErr.errs = this.validateEntryCodes(dataset);
        rslt.characterEcodeErr.errs = this.validateCharacterEncoding(dataset);
        return rslt.updateErr();
    }
};
