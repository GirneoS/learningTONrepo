import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

const manifestUrl = "https://github.com/GirneoS/learningTONrepo/blob/master/first_contract_frontend/manifest.json"

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App/>
  </TonConnectUIProvider>
)
