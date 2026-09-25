export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
