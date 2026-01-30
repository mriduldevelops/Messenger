import React from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatList from './pages/ChatList';
import ChatBox from './components/Chat/ChatBox';
import Settings from './pages/Settings';
function App() {
  const { user } = useAuth();
  return (
    <div className='min-h-screen w-full bg-white'>
      <Routes>
        <Route
          path="/"
          element={user ? <ChatList /> : <Navigate to="/login" />}
        />
        <Route path="/chat" element={<ChatBox />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App