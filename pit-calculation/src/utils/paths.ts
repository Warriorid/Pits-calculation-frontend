export const getStaticPath = (path: string): string => {
    const cleanPath = path.replace(/^\//, '');
    return `/Pits-calculation-frontend/${cleanPath}`;
  };
  
  export const getPwaPath = (path: string): string => {
    return getStaticPath(path);
  };