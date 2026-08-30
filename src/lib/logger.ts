export function log(message: string, meta: any = {}) {
  console.log(`[LOG] ${message}`, meta);
}

export function error(message: string, meta: any = {}) {
  console.error(`[ERROR] ${message}`, meta);
}
