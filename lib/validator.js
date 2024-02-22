import fs from 'fs';

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


//Error messages. For text notices only.
const MISSING_MSG = 'Missing mandatory attribute.';
const NOT_A_LIST_MSG = 'Valid array required.';
const FORMAT_ERR_MSG = 'Format mismatch.';
const EC_FORMAT_ERR_MSG = 'Entry code format mismatch (manually fix the attribute format).';
const EC_ERR_MSG = 'One of the entry codes required.';
const CHE_ERR_MSG = 'Character encoding mismatch.';

export class OCABundle {
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
        if (overlays.length > 1) {
            return overlays[0][TYPE_KEY].split("/").pop();
        } else if (overlays.length === 1) {
            return overlays[TYPE_KEY].split("/").pop();
        } else {
            return null;
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

    // start validation methods...

};