export const getStaticPath = (path: string): string => {
  const cleanPath = path.replace(/^\//, '');
  return `/pit-calculation/${cleanPath}`;
};

export const getPwaPath = (path: string): string => {
  return getStaticPath(path);
};