const labelToObject = (labelsArray) => {
  return labelsArray ? labelsArray.reduce((acc, label) => {
        const [key, value] = label.split('=');
        acc[key] = value;
        return acc;
      }, {}) : {};
}
const objectToLabel = (labelsObject) => {
  return labelsObject ? Object.entries(labelsObject).map(([key, value]) => `${key}=${value}`) : [];
};

export { objectToLabel, labelToObject}