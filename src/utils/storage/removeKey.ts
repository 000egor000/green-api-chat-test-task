export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}
