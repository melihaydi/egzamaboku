import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// "Ana Ekrana Ekle" (PWA) kurulabilirliği için servis çalışanı kaydı.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Servis çalışanı kaydı başarısız olsa da uygulama normal şekilde çalışmaya devam eder
    });
  });
}
