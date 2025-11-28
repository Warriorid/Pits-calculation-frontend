// src/utils/imageUtils.ts
export const getStaticImagePath = (imageName: string): string => {
  return `/static/img/${imageName}`;  // Это уже правильно
};