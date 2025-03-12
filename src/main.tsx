
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error boundary for the entire application
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }
    
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render application:", error);
    // Display fallback UI in case of critical errors
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
        <h1 style="color: #e11d48; margin-bottom: 16px;">Application Error</h1>
        <p style="margin-bottom: 24px;">We're sorry, but the application failed to load. Please try refreshing the page.</p>
        <button 
          style="background-color: #22c55e; color: white; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload()"
        >
          Refresh Page
        </button>
      </div>
    `;
  }
};

renderApp();
