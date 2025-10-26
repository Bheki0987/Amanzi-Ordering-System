import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Make sure this matches your HTML
const rootElement = document.getElementById('root');

// Add a console log to verify the element exists
console.log('Root element:', rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error('Root element not found!');
}