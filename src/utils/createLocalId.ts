let counter = 0;

export function createLocalId(): string {
  counter += 1;
  return `local-${Date.now().toString(36)}-${counter}`;
}
