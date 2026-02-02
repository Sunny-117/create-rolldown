import { useState } from 'react';

/**
 * A simple counter button component
 * @example
 * ```tsx
 * <MyButton />
 * ```
 */
export function MyButton() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((count) => count + 1)}>
      count is {count}
    </button>
  );
}
