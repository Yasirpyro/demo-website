import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/menu.css';
import App from './App';
import { applyRestaurantTheme } from './lib/theme';
applyRestaurantTheme();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
