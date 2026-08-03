export function buildFilters(filters: any) {
  const where: any = {};

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.category) {
    where.category = { contains: filters.category, mode: "insensitive" };
  }

  if (filters.agency) {
    where.agency = { contains: filters.agency, mode: "insensitive" };
  }

  if (filters.state) {
    where.eligibleStates = { contains: filters.state, mode: "insensitive" };
  }

  if (filters.minAmount) {
    where.amountMin = { gte: Number(filters.minAmount) };
  }

  if (filters.maxAmount) {
    where.amountMax = { lte: Number(filters.maxAmount) };
  }

  if (filters.deadlineBefore) {
    where.deadline = { lte: new Date(filters.deadlineBefore) };
  }

  if (filters.deadlineAfter) {
    where.deadline = { gte: new Date(filters.deadlineAfter) };
  }

  return where;
}
