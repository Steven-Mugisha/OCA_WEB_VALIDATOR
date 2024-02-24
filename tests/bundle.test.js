import OCABundle from "../lib/validator.js";

describe("OCABundle", () => {
  it("should return a json object for a bundle file.", async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    expect(bundle).toBeInstanceOf(OCABundle);
  });
});

describe("OCABundle", () => {
  it("should return a json object for the overlay specified.", async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const overlay = bundle.getOverlay("label");
    expect(overlay).toBeInstanceOf(Object);
  });
});


describe("OCABundle", () => {
  it("should return a version number for the bundle.", async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const version = bundle.getOverlayVersion("label");
    expect( typeof version).toBe("string");
  });
});

describe("OCABundle", () => {
  it("should return an object of attributes define in the schema bundle." , async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const attributes = bundle.getAttributes();
    expect(attributes).toBeInstanceOf(Object);
  });
});

describe("OCABundle", () => {
  it("should return a type of an attribute as a string." , async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const attrType = bundle.getAttributeType("Age");
    expect(typeof attrType).toBe("string");
  });
});

describe("OCABundle", () => {
  it("should return a type of an attribute as a string." , async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const attrFormat = bundle.getAttributeFormat("Age");
    expect(typeof attrFormat).toBe("string");
  });
});

describe("OCABundle", () => {
  it("should return a M (Mandatory) or O (optional) if attribute is required." , async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const attrComformance = bundle.getAttributeConformance("Age");
    expect(typeof attrComformance).toBe("string");
    ;
  });
});

describe("OCABundle", () => {
  it("should return an object of entry codes." , async () => {
    const bundle = new OCABundle();
    await bundle.loadedBundle(`${__dirname}/datasets/oca_bundle.json`);
    const entryCodes = bundle.getAttributeEntryCodes("Breed");
    expect(entryCodes).toBeInstanceOf(Object);

  });
});