import React, { useContext } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CurrencyContext } from '../context/CurrencyContext';
import { AuthContext } from '../context/AuthContext';
import { User, Globe, Info, LogOut, Shield } from 'lucide-react';

export default function Settings() {
    const { currency, setCurrency } = useContext(CurrencyContext);
    const { user, logout } = useContext(AuthContext);

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-6 pt-24 lg:p-8">
                <h1 className="text-3xl font-black mb-8">Settings</h1>

                <div className="max-w-2xl space-y-6">
                    {/* Profile Section */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-900">Profile</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-2xl font-black text-white">{initials}</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                                    <p className="text-lg font-bold text-slate-900">{user?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-medium text-slate-600">{user?.email || 'unknown@email.com'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User ID</p>
                                    <p className="text-xs font-mono text-slate-400">{user?.id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Currency Configuration */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="h-5 w-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-900">Currency</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Choose how amounts are displayed across the app. All data is stored in USD internally.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setCurrency('USD')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${currency === 'USD' ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <span className="text-2xl">🇺🇸</span>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">USD ($)</p>
                                    <p className="text-xs text-slate-500">US Dollar</p>
                                </div>
                                {currency === 'USD' && <div className="ml-auto h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center"><svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
                            </button>
                            <button 
                                onClick={() => setCurrency('INR')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${currency === 'INR' ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <span className="text-2xl">🇮🇳</span>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">INR (₹)</p>
                                    <p className="text-xs text-slate-500">Indian Rupee</p>
                                </div>
                                {currency === 'INR' && <div className="ml-auto h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center"><svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
                            </button>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="h-5 w-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-900">About PayPals</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Version</span>
                                <span className="text-sm font-bold text-slate-900">1.0.0</span>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Built With</p>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'Node.js', 'Express', 'MongoDB', 'MySQL', 'Redis', 'RabbitMQ', 'Socket.IO', 'Docker', 'Tailwind CSS'].map(tech => (
                                        <span key={tech} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200">{tech}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Architecture</p>
                                <p className="text-sm text-slate-500">Microservices architecture with API Gateway, event-driven messaging via RabbitMQ, and real-time updates via WebSockets.</p>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="h-5 w-5 text-rose-400" />
                            <h2 className="text-lg font-bold text-rose-600">Danger Zone</h2>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Signing out will clear your session. You will need to log in again.</p>
                        <button 
                            onClick={() => { logout(); window.location.href = '/login'; }}
                            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors active:scale-95"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
