import OCADataSet from "../lib/utils/files.js";
import OCABundle from "../lib/validator.js";

describe("OCADataSet", () => {
    it("should return dataset in json format from a csv file", async () => {
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
    it("should return an array with unmatched attributes",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/data_entry.xlsx`);
        const unmatchedAttributes = bundle.validateAttribute(dataset);
        expect(unmatchedAttributes).toBeInstanceOf(Array);
    });
});

describe("OCABundle", () => {
    it("should return an object with format errors",  async () => {
        const bundle = new OCABundle();
        await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
        const dataset = await OCADataSet.readExcel(`${__dirname}/datasets/data_entry.xlsx`);
        const formatErrors = bundle.validateFormat(dataset);
        // console.log(formatErrors);
        expect(formatErrors).toBeInstanceOf(Object);
    });
});