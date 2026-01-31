const typeofvalidtypes = [
  "boolean",
  "number",
  "function",
  "object",
  "string",
  "symbol",
  "undefined",
];

const aliasMap = {
  arr: "array",
  array: "array",
  "[]": "array",
  null: "null",
};

export default function isType(stuff, type) {
  if (!type) return false;
  const raw = String(type);
  const t = raw.toLowerCase();

  const norm = aliasMap[t] || t;

  if (norm === "array") return Array.isArray(stuff);
  if (norm === "null") return stuff === null;
  if (typeofvalidtypes.includes(norm)) return typeof stuff === norm;

  if (raw === "Array") return Array.isArray(stuff);

  return false;
}
