export function formatShares(value: number): string {
  // Format to 3 decimal places and strip trailing zeros
  const formatted = value.toFixed(3);
  // Remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+$/, '');
}
