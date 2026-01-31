const typeofvalidtypes =
  "boolean number function number object string symbol undefined".split(" ");
export default function isType(stuff, type) {
  if (typeofvalidtypes.includes(type)) return typeof stuff === type;
  if (type === "Array") return Array.isArray(stuff);
}
