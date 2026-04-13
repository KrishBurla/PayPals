import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import api from '../services/api';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [balances, setBalances] = useState({}); // groupId -> net balance for user
    const { user } = useContext(AuthContext);
    const { formatCurrency } = useContext(CurrencyContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            api.get('/groups/user').then(async res => {
                setGroups(res.data);
                const b = {};
                for (let g of res.data) {
                    try {
                        const bRes = await api.get(`/settlements/balances/${g._id}`);
                        let net = 0;
                        const bals = bRes.data.balances || {};
                        Object.keys(bals).forEach(key => {
                            const [wO, wI] = key.split(' -> ');
                            if (wO === user.id) net -= bals[key];
                            else if (wI === user.id) net += bals[key];
                        });
                        b[g._id] = net;
                    } catch(e) {}
                }
                setBalances(b);
            });
        }
    }, [user]);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-6 pt-24 lg:p-8">
                <h1 className="text-3xl font-black mb-8">Your Groups</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map(g => {
                        const net = balances[g._id] || 0;
                        return (
                            <div 
                                key={g._id} 
                                onClick={() => navigate(`/group/${g._id}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-teal-300 hover:shadow-md transition-all group"
                            >
                                <h2 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors">{g.name}</h2>
                                <p className="text-sm text-slate-500 mb-6">{g.members?.length || 0} Members</p>
                                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Balance</span>
                                    <span className={`text-lg font-black ${net > 0 ? 'text-teal-500' : net < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {net > 0 ? '+' : net < 0 ? '-' : ''}{formatCurrency(Math.abs(net))}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
