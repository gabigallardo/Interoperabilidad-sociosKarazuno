import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProviderWrapper } from './contexts/User.Context.jsx'
import { initMercadoPago } from '@mercadopago/sdk-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
const GOOGLE_CLIENT_ID = "1049192071464-8hjl1eapngul9iglm7ro0hvq50kc43f8.apps.googleusercontent.com";
initMercadoPago('TEST-abbad693-4bb5-4e40-8037-f32e31729208', { locale: 'es-AR' });
createRoot(document.getElementById('root')).render(     
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <UserProviderWrapper>
      <App />
    </UserProviderWrapper>
    </GoogleOAuthProvider>
  </StrictMode>,
)
