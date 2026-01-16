import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Rolldown + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Rolldown logo to learn more
    </p>
  </div>
`;

let counter = 0;
const button = document.querySelector<HTMLButtonElement>('#counter')!;
button.addEventListener('click', () => {
  counter++;
  button.innerHTML = `count is ${counter}`;
});
button.innerHTML = `count is ${counter}`;
