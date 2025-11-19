import { isTauri } from '../networkConfig';

export const getStaticPath = (path: string): string => {
  const cleanPath = path.replace(/^\//, '');
  
  if (isTauri) {
    return `./${cleanPath}`;
  }
  
  return `/pit-calculation/${cleanPath}`;
};

export const getPwaPath = (path: string): string => {
  return getStaticPath(path);
};