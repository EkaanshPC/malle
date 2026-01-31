import isType from "./typeHelpers";

export default function getArrFromSpread(args) {
  if (!Array.isArray(args)) return false;
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

export function areAllTypes(arr, type) {
  for (let i = 0; i < arr.length; i++) {
    if (!isType(arr[i], type)) return false;
  }
  return true;
}