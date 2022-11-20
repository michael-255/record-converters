const utils = require("./utils");

/**
 * REQUIRED
 */
const globals = {
  inputFileName: "ft-v13-export-2022-11-20.json",
  allInOneOutput: true, // change if you want seperate files
  allConvertedRecords: {},
  skippedRecords: {},
};

/***************************************************************************************************
 * Measurement Records
 **************************************************************************************************/
function convertMeasurementRecords() {
  const measurementRecords =
    utils.readFile(globals.inputFileName)?.measurementRecords || [];

  // Original Record Fields
  // {
  //   id: 'WB7-029-97C',
  //   type: 'MeasurementRecord',
  //   createdAt: 1645137416086,
  //   date: 'Thu Feb 17 2022',
  //   actionId: 'MLZ-5VD-XF2',
  //   actionName: 'Body Weight',
  //   value: 172
  // }

  const convertedRecords = [];
  globals.skippedRecords.measurementRecords = [];

  measurementRecords.forEach((record) => {
    // New Record Fields
    const id = utils.uuid();
    const createdDate = new Date(record.createdAt).toISOString() || "MISSING";
    const parentId = utils.valueToIdTranslation(record.actionName) || "MISSING";
    const measurementValue = record.value || "MISSING";

    if (
      createdDate === "MISSING" ||
      parentId === "MISSING" ||
      measurementValue === "MISSING"
    ) {
      globals.skippedRecords.measurementRecords.push(record); // Skipped
    } else {
      convertedRecords.push({
        id,
        createdDate,
        parentId,
        measurementValue,
      });
    }
  });

  globals.allConvertedRecords.measurementRecords = convertedRecords;
}

/***************************************************************************************************
 * Exercise Records
 **************************************************************************************************/
function convertExerciseRecords() {
  const exerciseRecords =
    utils.readFile(globals.inputFileName)?.exerciseRecords || [];

  // Original Record Fields
  // {
  //   "type": "ExerciseRecord",
  //   "createdAt": 1625221437591,
  //   "date": "Fri Jul 02 2021",
  //   "id": "3F6-836-N3M",
  //   "actionId": "8BH-A4O-4D6",
  //   "actionName": "Barbell Rows",
  //   "data": {
  //     "sets": [
  //       { "weight": "60", "reps": "5" },
  //       { "weight": "60", "reps": "5" },
  //       { "weight": "60", "reps": "5" },
  //       { "weight": "60", "reps": "5" },
  //       { "weight": "60", "reps": "5" }
  //     ]
  //   }
  // }

  const convertedRecords = [];
  globals.skippedRecords.exerciseRecords = [];

  exerciseRecords.forEach((record) => {
    // New Record Fields
    const id = utils.uuid();
    const createdDate = new Date(record.createdAt).toISOString() || "MISSING";
    const parentId = utils.valueToIdTranslation(record.actionName) || "MISSING";
    const weight = record?.data?.sets
      ?.map((set) => utils.getWeightFromSet(set))
      .filter((i) => i);
    const reps = record?.data?.sets
      ?.map((set) => utils.getRepsFromSet(set))
      .filter((i) => i);

    if (
      createdDate === "MISSING" ||
      parentId === "MISSING" ||
      weight.length === 0 ||
      reps.length === 0
    ) {
      globals.skippedRecords.exerciseRecords.push(record); // Skipped
    } else {
      convertedRecords.push({
        id,
        createdDate,
        parentId,
        weight,
        reps,
      });
    }
  });

  globals.allConvertedRecords.exerciseRecords = convertedRecords;
}

/***************************************************************************************************
 * Workout Records
 **************************************************************************************************/
function convertWorkoutRecords() {
  const workoutRecords =
    utils.readFile(globals.inputFileName)?.workoutRecords || [];

  // Original Record Fields
  // {
  //   id: 'LY0-TGR-0D6',
  //   type: 'WorkoutRecord',
  //   createdAt: 1666350244529,
  //   date: 'Fri Oct 21 2022',
  //   actionId: 'L8E-0EO-PPY',
  //   actionName: 'StrongLifts 5x5 - Alpha',
  //   endedAt: 1666350959580,
  //   duration: '11m 55s'
  // }

  const convertedRecords = [];
  globals.skippedRecords.workoutRecords = [];

  workoutRecords.forEach((record) => {
    // New Record Fields
    const id = utils.uuid();
    const createdDate = new Date(record.createdAt).toISOString() || "MISSING";
    const parentId = utils.valueToIdTranslation(record.actionName) || "MISSING";
    const finishedDate = record.endedAt
      ? new Date(record.endedAt).toISOString()
      : null;
    const exerciseRecordIds = [];

    // Find related exercise record ids
    globals.allConvertedRecords.exerciseRecords.forEach((er) => {
      const exerciseDate = new Date(er.createdDate).getTime(); // integar time

      if (
        exerciseDate >= record.createdAt - 2000 &&
        exerciseDate <= record.createdAt + 2000
      ) {
        exerciseRecordIds.push(er.id); // This should be the related exercise id
      }
    });

    if (
      createdDate === "MISSING" ||
      parentId === "MISSING" ||
      exerciseRecordIds.length === 0
    ) {
      globals.skippedRecords.workoutRecords.push(record); // Skipped
    } else {
      convertedRecords.push({
        id,
        createdDate,
        parentId,
        finishedDate,
        exerciseRecordIds,
      });
    }
  });

  globals.allConvertedRecords.workoutRecords = convertedRecords;
}

/**
 * Console Output
 */
function consoleOutput() {
  convertMeasurementRecords();
  convertExerciseRecords();
  convertWorkoutRecords();

  const printConvertedRecords = () => {
    const { measurementRecords, exerciseRecords, workoutRecords } =
      globals.allConvertedRecords;

    console.log("Measurement Records:", measurementRecords);
    console.log("Exercise Records:", exerciseRecords);
    console.log("Workout Records:", workoutRecords);
  };
  printConvertedRecords();

  const printSkippedRecords = () => {
    const { measurementRecords, exerciseRecords, workoutRecords } =
      globals.skippedRecords;

    console.log("(Skipped) Measurement Records:", measurementRecords);
    console.log("(Skipped) Exercise Records:", exerciseRecords);
    console.log("(Skipped) Workout Records:", workoutRecords);
  };
  printSkippedRecords();
}

/**
 * File Output
 */
function fileOutput() {
  convertMeasurementRecords();
  convertExerciseRecords();
  convertWorkoutRecords();

  if (globals.allInOneOutput) {
    // All in one file
    utils.writeFile("ft-v13-all-converted-records", {
      measurementRecords: globals.allConvertedRecords.measurementRecords,
      exerciseRecords: globals.allConvertedRecords.exerciseRecords,
      workoutRecords: globals.allConvertedRecords.workoutRecords,
    });
  } else {
    // Each in seperate files
    utils.writeFile("ft-v13-converted-measurement-records", {
      measurementRecords: globals.allConvertedRecords.measurementRecords,
    });
    utils.writeFile("ft-v13-converted-exercise-records", {
      exerciseRecords: globals.allConvertedRecords.exerciseRecords,
    });
    utils.writeFile("ft-v13-converted-workout-records", {
      workoutRecords: globals.allConvertedRecords.workoutRecords,
    });
  }
}

/**
 * Run conversions
 * $ node convert-records.js
 */
// consoleOutput();
fileOutput();
