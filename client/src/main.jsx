import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from '@/app/store';
import App from './App.jsx';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/global.css';

const toastStyle = {
  background: 'var(--color-surface-2)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ style: toastStyle }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
