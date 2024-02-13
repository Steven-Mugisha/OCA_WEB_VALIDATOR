import { OCADataSet } from "../lib/validator";

describe("OCADataSet", () => {
  describe("fromPath", () => {

    it("should return an OCADataSet instance", () => {
      const dataset = OCADataSet.fromPath(`${__dirname}/data_entry.xlsx`)
      console.log(dataset.dataset);
      expect(dataset).toBeInstanceOf(OCADataSet);
    });

  });
});