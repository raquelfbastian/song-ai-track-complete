import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ProductDetail from './pages/ProductDetail'
import Lab3 from './pages/Lab3'
import Lab4 from './pages/Lab4'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Lab 5: Storefront */}
        <Route path="/" element={<App />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Lab 3 & 4: Builder pages */}
        <Route path="/lab3" element={<Lab3 />} />
        <Route path="/lab4" element={<Lab4 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
