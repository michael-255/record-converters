const { v4 } = require("uuid");
const fs = require("fs");

module.exports = {
  /**
   * Read JSON input file
   */
  readFile(inputFile = "test.json") {
    try {
      const fileName = inputFile;
      const fileData = JSON.parse(fs.readFileSync(`input/${fileName}`, "utf8"));
      return fileData;
    } catch (error) {
      console.error(
        `ERROR: The file "${inputFile}" could not be found. Check the input folder.`
      );
      throw new Error("Stopping Execution");
    }
  },

  /**
   * Write JSON output file
   */
  writeFile(fileName, fileData) {
    const trailingId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const date = new Date().toISOString().split("T")[0];
    const preppedName = `output/${fileName}-${date}-${trailingId}.json`;
    const preppedData = JSON.stringify(fileData);

    fs.writeFile(preppedName, preppedData, function (err) {
      if (err) return console.log(err);
      console.log(`Finished writing file: "~/${preppedName}"`);
    });
  },

  /**
   * Creates v4 uuid string
   */
  uuid() {
    return v4();
  },

  /**
   * Translates old value to newer uuid
   */
  valueToIdTranslation(value) {
    return {
      // Measurements
      ["Body Weight"]: "b4450018-1506-450f-a429-9903aded5c9b",
      // Exercises
      ["Barbell Squats"]: "50c1fc75-0975-45f8-8177-ff4988b00de2",
      ["Barbell Bench Press"]: "d681459e-10c8-40ae-94e9-9b06b7c40367",
      ["Barbell Rows"]: "08b12cc1-d4b9-4d22-82db-9e33b3e5c3fa",
      ["Barbell Overhead Press"]: "cc279615-91a6-42ac-a073-4339e7c2034f",
      ["Deadlift"]: "b8f1a60e-7f21-4f62-8757-d9b371bffd45",
      // Workouts
      ["StrongLifts 5x5 - Alpha"]: "2158e1b2-27e0-4012-bb14-3846b3ee1d6a",
      ["StrongLifts 5x5 - Beta"]: "f3a1537c-4d63-43e1-99bd-df5ef59ac220",
    }[value];
  },

  /**
   * Weight from exercise set to integar
   */
  getWeightFromSet(set) {
    if (set.reps && set.reps !== "0" && set.weight) {
      return parseInt(set.weight);
    }
  },

  /**
   * Reps from exercise set to integar
   */
  getRepsFromSet(set) {
    if (set.reps && set.reps !== "0" && set.weight) {
      return parseInt(set.reps);
    }
  },
};
