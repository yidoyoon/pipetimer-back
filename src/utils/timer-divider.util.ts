export const timerDivider = (routine) => {
  const result = [];
  if (routine[0].data) {
    const data = routine[0].data;
    data.forEach((e) => {
      result.push({ ...routine[0], data: e });
    });
  }
  return result;
};
