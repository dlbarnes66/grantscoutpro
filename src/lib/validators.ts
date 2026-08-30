export function isNonEmpty(value: any) {
  return value !== null && value !== undefined && value !== "";
}

export function isNumber(value: any) {
  return typeof value === "number" && !isNaN(value);
}

export function validateObject(obj: Record<string, any>) {
  return Object.keys(obj).every((key) => obj[key] !== undefined);
}
