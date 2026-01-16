import { MyButton } from '../../src';

export function App() {
  return (
    <>
      <div>
        <a href="https://rolldown.rs" target="_blank" rel="noopener noreferrer">
          <img src="/rolldown.svg" class="logo" alt="Rolldown logo" />
        </a>
      </div>
      <h1>Rolldown + React</h1>
      <div class="card">
        <MyButton />
      </div>
      <p class="read-the-docs">
        Click on the Rolldown logo to learn more
      </p>
    </>
  );
}
