<script lang="ts">
  /**
   * A simple counter button component
   * @example
   * ```svelte
   * <MyButton />
   * ```
   */

  let count = $state(0);
</script>

<button type="button" onclick={() => count++}>
  count is {count}
</button>
