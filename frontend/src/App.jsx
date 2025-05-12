import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Translator from './components/Translation'
import LandingPage from "./components/LandingPage"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {

  return (
    <>
   <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/translator" element={<Translator />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
