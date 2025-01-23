import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api';
import './index.css'
import App from './App.tsx'
import "primereact/resources/themes/lara-light-cyan/theme.css";

const value = {
  zIndex: {
      modal: 99999999999,    // dialog, sidebar
      overlay: 999999999,  // dropdown, overlaypanel
      menu: 999999999,     // overlay menus
      tooltip: 99999999,   // tooltip
      toast: 9999999999,     // toast
  },
  autoZIndex: true,
};
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider value={value}>

      <App />
    </PrimeReactProvider>
  </StrictMode>,
)
