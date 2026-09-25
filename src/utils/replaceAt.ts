export function replaceAt<T>(items: T[], index: number, item: T): T[] {
  const copy = items.slice();
  copy[index] = item;
  return copy;
}
