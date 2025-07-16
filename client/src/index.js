import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <AuthProvider>
      <ThemeProvider>
      <App />
      </ThemeProvider>
    </AuthProvider>
);

reportWebVitals();
