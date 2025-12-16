import { isTauri } from '../networkConfig';

export const getStaticPath = (path: string): string => {
  const cleanPath = path.replace(/^\//, '');
<<<<<<< HEAD
  return `/Pits-calculation-frontend/${cleanPath}`;
=======
  
  if (isTauri) {
    return `./${cleanPath}`;
  }
  
  return `/pit-calculation/${cleanPath}`;
>>>>>>> 2c3c7ee224d951a7a6fefb49b82ff73fac5eba9d
};

export const getPwaPath = (path: string): string => {
  return getStaticPath(path);
};