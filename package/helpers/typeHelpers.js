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
  any: "any",
};

function _isPrimitiveMatch(stuff, norm) {
  if (norm === "array") return Array.isArray(stuff);
  if (norm === "null") return stuff === null;
  if (norm === "any") return true;
  if (typeofvalidtypes.includes(norm)) return typeof stuff === norm;
  return false;
}

export default function isType(stuff, type) {
  if (!type) return false;
  const raw = String(type).trim();

  // union (e.g. "string|number[]")
  if (raw.includes("|")) {
    return raw.split("|").map((p) => p.trim()).some((part) => isType(stuff, part));
  }

  // array-of-type syntax (T[])
  if (raw.endsWith("[]")) {
    const elemType = raw.slice(0, -2) || "any";
    if (!Array.isArray(stuff)) return false;
    return stuff.every((el) => isType(el, elemType));
  }

  const t = raw.toLowerCase();
  const norm = aliasMap[t] || t;

  if (_isPrimitiveMatch(stuff, norm)) return true;
  if (raw === "Array") return Array.isArray(stuff);

  return false;
}
