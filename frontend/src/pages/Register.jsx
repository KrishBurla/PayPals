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
            const response = await api.post('/auth/register', { name, email, password });
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Animated gradient background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-float" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-float-delayed" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse-slow" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 max-w-md w-full">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 space-y-6 border border-white/10 ring-1 ring-white/5">
                    
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 animate-in">
                            <span className="text-3xl font-black text-white">P</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
                        <p className="text-white/50 text-sm font-medium">Join to start splitting expenses with friends.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl text-sm font-bold border border-rose-500/20 text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-white/70 mb-1.5">Full Name</label>
                            <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all backdrop-blur-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/70 mb-1.5">Email Address</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all backdrop-blur-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white/70 mb-1.5">Password</label>
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all backdrop-blur-sm font-medium" />
                        </div>
                        
                        <button type="submit" disabled={isLoading} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center">
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-white/40 pt-2 border-t border-white/10">
                        Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Log In</Link>
                    </p>
                </div>
                <p className="text-center text-xs text-white/20 mt-6 font-medium">PayPals • Split expenses effortlessly</p>
            </div>
        </div>
    );
};

export default Register;