<script lang="ts">
  import { MyButton } from '../../src';
</script>

<main>
  <div>
    <a href="https://rolldown.rs" target="_blank" rel="noopener noreferrer">
      <img src="/rolldown.svg" class="logo" alt="Rolldown logo" />
    </a>
  </div>
  <h1>Rolldown + Svelte</h1>
  <div class="card">
    <MyButton />
  </div>
  <p class="read-the-docs">
    Click on the Rolldown logo to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
</style>
