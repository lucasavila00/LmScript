// import { type ClassValue, clsx } from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

export function cn(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}

// export function randomElement(array: Array<any>) {
//   return array[Math.floor(Math.random() * array.length)];
// }

export const newUuid = () => crypto.randomUUID();
