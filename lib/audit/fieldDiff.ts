export function fieldDiff(oldData: any, newData: any) {
  const changes: any[] = [];

  for (const key of Object.keys(newData)) {
    const before = oldData?.[key];
    const after = newData[key];

    if (before !== after) {
      changes.push({
        field: key,
        before,
        after,
      });
    }
  }

  return changes;
}
