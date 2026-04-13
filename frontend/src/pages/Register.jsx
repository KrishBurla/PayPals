// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            // Sends the request to your Gateway -> Auth Service
            const response = await api.post('/auth/register', { name, email, password });
            login(response.data.token); // Save token
            navigate('/dashboard');     // Teleport to dashboard
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100">
                
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-teal-200">
                        <span className="text-3xl font-bold text-teal-600">$</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 text-sm font-medium">Join to start splitting expenses.</p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold border border-rose-100 text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white font-medium" />
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center">
                        {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
                    Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;