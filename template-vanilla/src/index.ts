/**
 * A simple greeting function
 * @param name - The name to greet
 * @returns A greeting message
 * @example
 * ```ts
 * greet('World') // "Hello, World!"
 * ```
 */
export function greet(name: string = 'Rolldown'): string {
  return `Hello, ${name}!`;
}

/**
 * A simple counter class
 * @example
 * ```ts
 * const counter = new Counter();
 * counter.increment(); // 1
 * counter.increment(); // 2
 * counter.value; // 2
 * ```
 */
export class Counter {
  private count: number = 0;

  increment(): number {
    return ++this.count;
  }

  decrement(): number {
    return --this.count;
  }

  get value(): number {
    return this.count;
  }

  reset(): void {
    this.count = 0;
  }
}
