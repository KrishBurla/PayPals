import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider, CurrencyContext } from './context/CurrencyContext'; // <-- Phase 2 Currency
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import { Sidebar } from './components/Sidebar';

import GroupsPage from './pages/Groups';

// Dummy imports for Phase 4
const ActivityPage = () => <div className="p-10 font-bold text-2xl">Activity Feed (WIP)</div>;
const SettingsPage = () => {
    const { currency, setCurrency } = React.useContext(CurrencyContext);
    return (
        <div className="p-10">
            <h1 className="font-bold text-3xl mb-6">Settings</h1>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                <p className="font-bold mb-4">Currency Configuration</p>
                <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full max-w-xs appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                </select>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <CurrencyProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/groups" element={<GroupsPage />} />
                        <Route path="/activity" element={<div className="flex bg-slate-50 min-h-screen"><Sidebar /><main className="flex-1 lg:ml-72"><ActivityPage/></main></div>} />
                        <Route path="/settings" element={<div className="flex bg-slate-50 min-h-screen"><Sidebar /><main className="flex-1 lg:ml-72"><SettingsPage/></main></div>} />
                        <Route path="/group/:id" element={<GroupDetail />} />
                    </Routes>
                </Router>
            </CurrencyProvider>
        </AuthProvider>
    );
}
export default App;
