import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-float-delayed" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl animate-pulse-slow" />
                {/* Grid overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 max-w-md w-full">
                {/* Glass card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 space-y-6 border border-white/10 ring-1 ring-white/5">
                    
                    {/* Header Section */}
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30 animate-in">
                            <span className="text-3xl font-black text-white">P</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-white/50 text-sm font-medium">Enter your details to access your splits.</p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl text-sm font-bold border border-rose-500/20 text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    
                    {/* Form Section */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white/70 mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all backdrop-blur-sm font-medium"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/70 mb-1.5">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all backdrop-blur-sm font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Sign In"}
                        </button>
                    </form>
                    <p className="text-center text-sm font-medium text-white/40 pt-2 border-t border-white/10">
                        Don't have an account? <Link to="/register" className="text-teal-400 font-bold hover:text-teal-300 transition-colors">Sign Up</Link>
                    </p>
                </div>
                <p className="text-center text-xs text-white/20 mt-6 font-medium">PayPals • Split expenses effortlessly</p>
            </div>
        </div>
    );
};

export default Login;