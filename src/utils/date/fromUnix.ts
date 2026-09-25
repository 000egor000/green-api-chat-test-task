export function fromUnix(timestamp: number): Date {
  return new Date(timestamp * 1000);
}
