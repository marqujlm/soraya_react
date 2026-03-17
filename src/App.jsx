import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Chat from './pages/Chat';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import Profile from './pages/Profile';

// Um componente simples para proteger a rota do chat
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
  return currentUser ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rota disponível APENAS em ambiente de desenvolvimento (localhost) */}
          {import.meta.env.DEV && (
            <Route path="/admin/register" element={<AdminRegister />} />
          )}

          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
