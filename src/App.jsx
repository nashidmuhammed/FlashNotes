import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import './App.css'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/home' exact element={<Home />} />
          <Route path='/' exact element={<Home />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App