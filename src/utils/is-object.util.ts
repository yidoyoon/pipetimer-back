export const isObject = (obj: any): boolean => {
  if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
    return true;
  }
  return false;
};
