// src/pages/GroupDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Get logged-in user
    
    const [group, setGroup] = useState(null);
    const [balances, setBalances] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGroupData = async () => {
        try {
            const [groupRes, balanceRes] = await Promise.all([
                api.get(`/groups/${id}`),
                api.get(`/settlements/balances/${id}`)
            ]);
            setGroup(groupRes.data);
            setBalances(balanceRes.data.balances);
        } catch (error) {
            console.error("Failed to fetch group details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Send the request to your API Gateway
            await api.post('/expenses', {
                groupId: id,
                amount: Number(amount),
                description: description,
                splitType: 'EQUAL',
                // 🪄 THE MAGIC TRICK: We are adding a fake friend so the math has someone to split with!
                participants: [user.id, "dummy-friend-123"] 
            });

            // Close modal, clear form, and refresh balances!
            setIsModalOpen(false);
            setDescription('');
            setAmount('');
            await fetchGroupData();
        } catch (error) {
            console.error("Failed to add expense", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-10 relative">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b border-gray-200 p-4">
                <div className="max-w-4xl mx-auto flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800 font-medium">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 border-l-2 border-gray-200 pl-4">{group?.name}</h1>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
                {/* Action Bar */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Group Balances</h2>
                        <p className="text-gray-500 text-sm mt-1">See who owes who in real-time.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all active:scale-95 flex items-center space-x-2"
                    >
                        <span className="text-xl">🧾</span>
                        <span>Add Expense</span>
                    </button>
                </div>

                {/* Balances List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {Object.keys(balances).length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="text-5xl mb-4">🍻</div>
                            <h3 className="text-lg font-bold text-gray-800">You are all settled up!</h3>
                            <p className="text-gray-500">No one owes anything in this group.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {Object.entries(balances).map(([relationship, amount], index) => {
                                const [debtor, creditor] = relationship.split(' -> ');
                                // Make the IDs look slightly nicer
                                const debtorName = debtor === 'dummy-friend-123' ? 'Dummy Friend' : 'You';
                                const creditorName = creditor === user.id ? 'You' : creditor.substring(0,8);

                                return (
                                    <li key={index} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-xl font-bold border border-red-100">
                                                💸
                                            </div>
                                            <div>
                                                <p className="text-gray-900 text-lg">
                                                    <span className="font-bold">{debtorName}</span> owes <span className="font-bold">{creditorName}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ${amount.toFixed(2)}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </main>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🧾</span> Add a New Expense
                        </h2>
                        <form onSubmit={handleAddExpense}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">What was this for?</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Dinner, Taxi, Groceries" 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">How much did it cost?</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            step="0.01"
                                            min="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 disabled:opacity-70 transition-colors"
                                >
                                    {isSubmitting ? "Saving..." : "Save Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetail;