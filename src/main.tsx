import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// ✅ Автоматически добавляем X-Telegram-Init-Data ко всем запросам к нашему API
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init: RequestInit = {}) {
  const url = typeof input === 'string' ? input : input.toString();

  if (url.includes('bekobod-app-1.onrender.com/api')) {
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData || '';

    init.headers = {
      ...(init.headers || {}),
      'X-Telegram-Init-Data': initData,
    };
  }

  return originalFetch(input, init);
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);