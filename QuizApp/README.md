# QuizApp

Een eenvoudige live-quiz applicatie gebouwd met React en Vite. De host kiest vragen; spelers joinen met een room ID en antwoorden live. Realtime synchronisatie gebeurt via een Node.js WebSocket server (`ws`).

## Uitvoeren

1. Installeer dependencies:
   ```bash
   npm install
   ```
2. Start de WebSocket-server (poort 3001 standaard):
   ```bash
   npm run server
   ```
3. Start de frontend (Vite dev server):
   ```bash
   npm run dev
   ```

## Projectstructuur (kort)

- Frontend: React + Vite (`src/`)
- WebSocket-server: Node + `ws` (`server/index.js`)
- Data: `src/data/motorcycleQuestions.js` (eigen dataset; opties krijgen dynamische achtergrondafbeeldingen)

## Sources (gebruikt in dit project)

- Dependencies
  - React: `https://react.dev/`
  - React DOM: `https://www.npmjs.com/package/react-dom`
  - Vite: `https://vitejs.dev/`
  - @vitejs/plugin-react (Fast Refresh/Babel): `https://github.com/vitejs/vite-plugin-react`
  - ws (WebSocket server, Node): `https://github.com/websockets/ws`

- Dev tooling
  - ESLint: `https://eslint.org/`
  - @eslint/js: `https://www.npmjs.com/package/@eslint/js`
  - eslint-plugin-react-hooks: `https://www.npmjs.com/package/eslint-plugin-react-hooks`
  - eslint-plugin-react-refresh: `https://www.npmjs.com/package/eslint-plugin-react-refresh`
  - globals (ESLint globals): `https://www.npmjs.com/package/globals`
  - npm-run-all: `https://github.com/mysticatea/npm-run-all`
  - Node.js runtime: `https://nodejs.org/`

- Web APIs (documentatie geraadpleegd; direct gebruikt in code)
  - WebSocket API (frontend): `https://developer.mozilla.org/docs/Web/API/WebSocket`
  - Web Storage / localStorage: `https://developer.mozilla.org/docs/Web/API/Window/localStorage`
  - URLSearchParams: `https://developer.mozilla.org/docs/Web/API/URLSearchParams`
  - History API `replaceState`: `https://developer.mozilla.org/docs/Web/API/History/replaceState`
  - `crypto.randomUUID()`: `https://developer.mozilla.org/docs/Web/API/Crypto/randomUUID`

