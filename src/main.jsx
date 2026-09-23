import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "./context/ThemeContext";
import './index.css'
import App from './App.jsx'
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/archivo/900.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/archivo/300.css";
import "@fontsource/cairo/300.css";
import "@fontsource/hind/300.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/cairo/700.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)