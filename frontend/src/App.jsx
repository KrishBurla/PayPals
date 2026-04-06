// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- NEW
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} /> {/* <-- NEW */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/group/:id" element={<GroupDetail />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;