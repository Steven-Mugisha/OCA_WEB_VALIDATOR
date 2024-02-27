import OCADataSetErr from "../lib/utils/Err.js";
import OCADataSet from "../lib/utils/files.js";
import OCABundle from "../lib/validator.js";

describe("OCADataSet", () => {
    it("should return dataset in json format from a csv file.", async () => {
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/data_entry.xlsx`);
        expect(dataset).toBeInstanceOf(Object);
    });
});

describe("OCABundle", () => {
  it("should return a json object for a bundle file.", async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    expect(bundle).toBeInstanceOf(OCABundle);
  });
});

// validating attributes
describe("OCABundle", () => {
    it("should return an array with unmatched attributes.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/err_data_entry.xlsx`);
        const unmatchedAttributes = bundle.validateAttribute(dataset);
        // console.log(unmatchedAttributes);
        expect(unmatchedAttributes).toBeInstanceOf(Array);
    });
});

describe("OCABundle", () => {
    it("should return an object with format errors.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/data_entry.xlsx`);
        const formatErrors = bundle.validateFormat(dataset);
        expect(formatErrors).toBeInstanceOf(Object);
    });
});

describe("OCABundle", () => {
    it("should return an object with unmatched entry codes.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/data_entry.xlsx`);
        // console.log(dataset);
        const entryCodeErrors = bundle.validateEntryCodes(dataset, "Breed");
        expect(entryCodeErrors).toBeInstanceOf(Object);
    });
});

describe("OCABundle", () => {
    it("should return an array warning messages for flagged attributes.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const flaggedAttributes = bundle.flaggedAlarm();
        expect(flaggedAttributes).toBeInstanceOf(Object);
    });
});

describe("OCABundle", () => {
    it("should return an a string of a warning about mismatching overlay version and OCA bundle.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const versionAlarm = bundle.versionAlarm();
        expect(typeof versionAlarm).toBe("string");
    });
});

describe("OCABundle", () => {
    it("should return an object rslt with all issues to correct.",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/err_data_entry.xlsx`);
        const validate = bundle.validate(dataset);
        // console.log(validate);
        expect(validate).toBeInstanceOf(Object);
    });
})