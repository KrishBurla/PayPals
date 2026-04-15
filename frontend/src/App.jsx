import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import GroupsPage from './pages/Groups';
import Settings from './pages/Settings';
import { Sidebar } from './components/Sidebar';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <Toaster position="top-right" reverseOrder={false} />
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/group/:id" element={<GroupDetail />} />
                    </Routes>
                </Router>
            </CurrencyProvider>
        </AuthProvider>
    );
}
export default App;
