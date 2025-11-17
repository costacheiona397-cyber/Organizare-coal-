import React from 'react';
import { createRoot } from 'react-dom/client';
import SchoolPlannerApp from './SchoolPlannerApp.jsx';

const root = createRoot(document.getElementById('root'));
root.render(<SchoolPlannerApp />);

// Register simple service worker for PWA installability (optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
