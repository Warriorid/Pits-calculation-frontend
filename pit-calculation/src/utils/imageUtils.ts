// src/utils/imageUtils.ts
import { isTauri } from '../networkConfig';

export const getStaticImagePath = (imageName: string): string => {
  return isTauri 
    ? `./static/img/${imageName}`
    : `/pit-calculation/static/img/${imageName}`;
};