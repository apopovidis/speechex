export const isNotEmptyArray = obj => Array.isArray(obj) && obj.length > 0;

export const sortArray = (arr, field, isAsc) =>
  arr.sort((a, b) => {
    let aField = a[field];
    let bField = b[field];
    if (typeof aField === "string") {
      aField = new Date(aField);
    }
    if (typeof bField === "string") {
      bField = new Date(bField)
    }

    if (isAsc) {
      return aField-bField;
    }

    return bField-aField;
  });

// https://stackoverflow.com/questions/14782232/how-to-avoid-cannot-read-property-of-undefined-errors
export const getSafely = (fn, defaultVal) => {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
};
