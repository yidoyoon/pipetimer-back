export const propsAdder = <T>(arr: T[], props: any) => {
  let result = [];
  result = arr.map((item) => {
    for (const idx in props) {
      item[Object.keys(props)[idx]] = Object.values(props)[idx];
    }
  });
  return result;
};
