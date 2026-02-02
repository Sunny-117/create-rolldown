import { createSignal } from 'solid-js';

/**
 * A simple counter button component
 * @example
 * ```tsx
 * <MyButton />
 * ```
 */
export function MyButton() {
  const [count, setCount] = createSignal(0);

  return (
    <button type="button" onClick={() => setCount((count) => count + 1)}>
      count is {count()}
    </button>
  );
}
