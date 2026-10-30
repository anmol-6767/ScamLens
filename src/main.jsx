import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'
createRoot(document.getElementById('root')).render(
  <BrowserRouter><AuthProvider><App/><Toaster position="top-right" toastOptions={{style:{background:'#14173d',color:'#fff',border:'1px solid rgba(255,255,255,.1)'}}}/></AuthProvider></BrowserRouter>)
