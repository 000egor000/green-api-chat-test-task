export class BoundedMap<K, V> {
  private readonly items = new Map<K, V>();

  constructor(private readonly limit: number) {}

  set(key: K, value: V): void {
    this.items.delete(key);
    this.items.set(key, value);
    if (this.items.size > this.limit) {
      const oldest = this.items.keys().next();
      if (!oldest.done) this.items.delete(oldest.value);
    }
  }

  take(key: K): V | undefined {
    const value = this.items.get(key);
    this.items.delete(key);
    return value;
  }
}
