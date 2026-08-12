# Traffic Sim

A small Three.js traffic simulation project built with Vite and TypeScript.

## Requirements

- Node.js
- nvm (recommended for managing Node versions)
- npm

## Recommended setup with nvm

1. Install nvm if you do not already have it.
2. Install and use a compatible Node version:

```bash
nvm install
nvm use
```

If you want to be explicit:

```bash
nvm install 22
nvm use 22
```

3. Install dependencies:

```bash
npm install
```

## Run the app

Start the development server with Vite:

```bash
npx vite
```

This will start the local dev server and print a URL such as:

```bash
http://localhost:5173/
```

Open that address in your browser to view the project.

## Production build

To create a production build:

```bash
npx vite build
```

To preview the production build locally:

```bash
npx vite preview
```

## Project structure

```text
src/
  main.ts
  scripts/
    car.ts
    input.ts
    player.ts
    world.ts
```

## Notes

- `npm install` installs the dependencies defined in `package.json`.
- `npx vite` uses the local Vite installation from the project without needing a global install.
- If the dev server does not start, verify that your Node version is installed correctly and that dependencies are installed.
