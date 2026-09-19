import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/archivo/900.css";
import "@fontsource/amiri/700-italic.css";
import "@fontsource/noto-serif-devanagari/600.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/archivo/300.css";
import "@fontsource/cairo/300.css";
import "@fontsource/hind/300.css";
import "@fontsource/noto-sans-sc/300.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
    