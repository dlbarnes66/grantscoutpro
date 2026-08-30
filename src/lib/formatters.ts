export function formatCurrency(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString();
}
