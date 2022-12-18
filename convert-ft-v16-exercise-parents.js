const utils = require("./utils");

/**
 * REQUIRED
 */
const globals = {
  inputFileName: "v16-exercise-parents.json",
  allInOneOutput: true, // change if you want seperate files
  allConverted: {},
  skipped: {},
};

/***************************************************************************************************
 * Exercise Parents
 **************************************************************************************************/
function convertExerciseParents() {
  const exerciseParents =
    utils.readFile(globals.inputFileName)?.exercises || [];

  // Original Parent Fields
  // {
  //   "id": "016abce5-2882-4549-b284-d17acad67ef1",
  //   "createdDate": "2022-12-03T18:49:01.598Z",
  //   "name": "PT Isometric Hip Abduction 2xD (2x15)",
  //   "exerciseTracks": "Reminder Only"
  // }

  const converted = [];
  globals.skipped.exerciseParents = [];

  exerciseParents.forEach((parent) => {
    // New Parent Fields
    const type = "Exercise-Parent";
    const id = parent.id;
    const createdTimestamp = 1641013200000;
    const parentStatus = "Enabled";
    const name = parent.name;
    const description = "TODO DESCRIPTION";
    const exerciseInputs = [];

    if (parent.exerciseTracks === "Reminder Only") {
      exerciseInputs.push("Confirmation");
    } else if (parent.exerciseTracks === "Weight & Reps") {
      if (
        parent.id === "4976dbac-8bce-4ad4-b9d6-27edeecb93d0" // bands
      ) {
        exerciseInputs.push("Multiple Sets");
        exerciseInputs.push("Reps");
      } else {
        exerciseInputs.push("Multiple Sets");
        exerciseInputs.push("Weight (Lbs)");
        exerciseInputs.push("Reps");
      }
    }

    converted.push({
      type,
      id,
      createdTimestamp,
      parentStatus,
      name,
      description,
      exerciseInputs,
    });
  });

  globals.allConverted.exerciseParents = converted;
}

/**
 * Console Output
 */
function consoleOutput() {
  convertExerciseParents();

  const printConvertedRecords = () => {
    const { exerciseParents } = globals.allConverted;

    console.log("Exercise Parents:", exerciseParents);
  };
  printConvertedRecords();

  const printSkippedRecords = () => {
    const { exerciseParents } = globals.skipped;

    console.log("(Skipped) Exercise Parents:", exerciseParents);
  };
  printSkippedRecords();
}

/**
 * File Output
 */
function fileOutput() {
  convertExerciseParents();

  if (globals.allInOneOutput) {
    // All in one file
    utils.writeFile("ft-v16-output-all", {
      exerciseParents: globals.allConverted.exerciseParents,
    });
  } else {
    // Each in seperate files
    utils.writeFile("ft-v16-output-exercise-parents", {
      exerciseParents: globals.allConverted.exerciseParents,
    });
  }
}

/**
 * Run conversions
 * $ node convert-records.js
 */
consoleOutput();
fileOutput();
