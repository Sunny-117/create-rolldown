import { MyButton } from '../../src';

export function App() {
  return (
    <>
      <div>
        <a href="https://rolldown.rs" target="_blank" rel="noopener noreferrer">
          <img src="/rolldown.svg" className="logo" alt="Rolldown logo" />
        </a>
      </div>
      <h1>Rolldown + SolidJS</h1>
      <div className="card">
        <MyButton />
      </div>
      <p className="read-the-docs">Click on the Rolldown logo to learn more</p>
    </>
  );
}
