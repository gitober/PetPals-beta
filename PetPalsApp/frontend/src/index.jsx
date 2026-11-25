import React from 'react';
import ReactDOM from 'react-dom/client';
// Font Awesome icons, served by PetPals itself instead of an outside CDN
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
