export function formatShares(value: number): string {
  // format to 3 decimal places and strip trailing zeros
  const formatted = value.toFixed(3);
  // remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+$/, '');
}
