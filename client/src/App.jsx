
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home.jsx'
import UserPage from './Result.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:handle" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  )
} 