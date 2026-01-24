import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
function App() {
  const { user } = useAuth();
  return (
    <div className='min-h-screen w-full bg-white'>
      <Routes>
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App