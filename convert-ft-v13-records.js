const utils = require("./utils");

const allConvertedRecords = {};

/**
 * REQUIRED: Valid JSON file to read record data from!
 */
function getFileData(inputFile = "ft-v13-export-2022-10-25.json") {
  try {
    const fullFileNameToConvert = inputFile;
    const fileData = utils.readFile(fullFileNameToConvert);
    return fileData;
  } catch (error) {
    console.error(
      `ERROR: The file "${inputFile}" could not be found. Check the input folder.`
    );
    throw new Error("Stopping Execution");
  }
}

/**
 * #################################################################################################
 * Measurement Records
 * #################################################################################################
 */
function convertMeasurementRecords() {
  const measurementRecords = getFileData()?.measurementRecords || [];

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
      // console.log("Skipping record with missing values:", record);
    } else {
      convertedRecords.push({
        id,
        createdDate,
        parentId,
        measurementValue,
      });
    }
  });

  allConvertedRecords.measurementRecords = convertedRecords;
}

/**
 * #################################################################################################
 * Exercise Records
 * #################################################################################################
 */
function convertExerciseRecords() {
  const exerciseRecords = getFileData()?.exerciseRecords || [];

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
      // console.log("Skipping record with missing values:", record);
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

  allConvertedRecords.exerciseRecords = convertedRecords;
}

/**
 * #################################################################################################
 * Workout Records
 * #################################################################################################
 */
function convertWorkoutRecords() {
  const workoutRecords = getFileData()?.workoutRecords || [];

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

  workoutRecords.forEach((record) => {
    // New Record Fields
    const id = utils.uuid();
    const createdDate = new Date(record.createdAt).toISOString() || "MISSING";
    const parentId = utils.valueToIdTranslation(record.actionName) || "MISSING";
    const finishedDate = new Date(
      record.endedAt || record.createdAt + 2700000 // 45 minutes if we don't know the time
    ).toISOString();
    const exerciseRecordIds = [];

    // Find related exercise record ids
    allConvertedRecords.exerciseRecords.forEach((er) => {
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
      console.log("Skipping record with missing values:", record);
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

  allConvertedRecords.workoutRecords = convertedRecords;
}

/**
 * Console Output
 */
function consoleOutput() {
  convertMeasurementRecords();
  convertExerciseRecords();
  convertWorkoutRecords();
  console.log(allConvertedRecords.measurementRecords);
  console.log(allConvertedRecords.exerciseRecords);
  console.log(allConvertedRecords.workoutRecords);
}

/**
 * File Output
 */
function fileOutput() {
  convertMeasurementRecords();
  convertExerciseRecords();
  convertWorkoutRecords();
  utils.writeFile(
    "ft-v13-converted-measurement-records",
    allConvertedRecords.measurementRecords
  );
  utils.writeFile(
    "ft-v13-converted-exercise-records",
    allConvertedRecords.exerciseRecords
  );
  utils.writeFile(
    "ft-v13-converted-workout-records",
    allConvertedRecords.workoutRecords
  );
}

/**
 * Run conversions
 * $ node convert-records.js
 */
// consoleOutput();
fileOutput();
