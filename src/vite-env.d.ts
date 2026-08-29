/// <reference types="vite/client" />

// Pulls in Vite's ambient types so import.meta.env is typed (used by
// ./lib/serviceWorker to skip registration in dev). tsconfig.json has no
// "include", so TypeScript picks this file up automatically.
