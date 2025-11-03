import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './utils/storage';
import reportWebVitals from './reportWebVitals'; // <-- pindahkan ke atas

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
