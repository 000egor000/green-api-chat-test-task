import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { APP_TEXTS } from './constants';

import './index.css';

document.title = APP_TEXTS.documentTitle;

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
