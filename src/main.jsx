import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { AppRouter } from './router/AppRouter'

createRoot(document.getElementById('root')).render(<AuthProvider><AppRouter /></AuthProvider>)
