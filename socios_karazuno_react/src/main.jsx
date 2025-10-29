import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProviderWrapper } from './contexts/User.Context.jsx'
import { initMercadoPago } from '@mercadopago/sdk-react';
initMercadoPago('TEST-abbad693-4bb5-4e40-8037-f32e31729208', { locale: 'es-AR' });
createRoot(document.getElementById('root')).render(     
  <StrictMode>
    <UserProviderWrapper>
      <App />
    </UserProviderWrapper>
  </StrictMode>,
)
