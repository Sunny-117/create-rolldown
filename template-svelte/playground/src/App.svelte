<script lang="ts">
  import { MyButton } from '../../src';

  let lastCount = $state(0);

  function handleCountChange(count: number) {
    lastCount = count;
    console.log('Count changed:', count);
  }
</script>

<main>
  <h1>Rolldown + Svelte</h1>
  
  <div class="card">
    <h2>MyButton Component</h2>
    <MyButton label="Count" onclick={handleCountChange} />
    <p>Last count received: {lastCount}</p>
  </div>

  <div class="card">
    <h2>Custom Label</h2>
    <MyButton label="Rolldown" onclick={(count) => console.log('Clicked', count)} />
  </div>

  <p class="read-the-docs">
    Edit <code>src/MyButton.svelte</code> to test your component
  </p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    font-size: 3em;
    font-weight: 300;
    margin-bottom: 1em;
  }

  h2 {
    font-size: 1.2em;
    margin-bottom: 1em;
    color: #333;
  }

  .card {
    margin-top: 2em;
    padding: 2em;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }

  .card p {
    margin-top: 1em;
    color: #666;
  }

  @media (min-width: 640px) {
    main {
      max-width: 800px;
    }
  }

  @media (prefers-color-scheme: light) {
    h2 {
      color: #333;
    }
  }

  @media (prefers-color-scheme: dark) {
    h2 {
      color: #fff;
    }
    .card {
      background: #1a1a1a;
      border-color: #333;
    }
    .card p {
      color: #999;
    }
  }
</style>
