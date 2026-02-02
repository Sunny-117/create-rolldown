<script setup lang="ts">
import { ref } from 'vue';

/**
 * A simple counter button component
 * @example
 * ```vue
 * <MyButton />
 * ```
 */

const count = ref(0);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>
</template>
