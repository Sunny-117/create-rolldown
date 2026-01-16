<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <div class="card">
    <h1>{{ msg }}</h1>

    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit
        <code>src/components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <p>
      Check out
      <a href="https://rolldown.rs/guide/" target="_blank">Rolldown Docs</a>,
      <a href="https://vuejs.org/guide/quick-start.html" target="_blank">Vue Docs</a>, and
      <a href="https://github.com/unplugin/unplugin-vue" target="_blank">unplugin-vue</a>.
    </p>
    <p class="read-the-docs">Click on the Rolldown and Vue logos to learn more</p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
