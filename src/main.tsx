import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installFavicon } from './lib/favicon';
import { installTitle } from './lib/title';
import { installManifest } from './lib/manifest';
import { installFonts } from './lib/fonts';
import { registerServiceWorker } from './lib/serviceWorker';

installTitle();
installFavicon();
installManifest();
installFonts();
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
