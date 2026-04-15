import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { Plus, Users, X, Search } from 'lucide-react';
import api from '../services/api';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [balances, setBalances] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { user } = useContext(AuthContext);
    const { formatCurrency } = useContext(CurrencyContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);
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

    const toggleMember = (userId) => {
        setSelectedMembers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) { alert('Please enter a group name'); return; }
        setIsCreating(true);
        try {
            const members = [...new Set([user.id, ...selectedMembers])];
            await api.post('/groups', { name: newGroupName, members });
            setIsCreateOpen(false);
            setNewGroupName('');
            setSelectedMembers([]);
            // Refresh groups
            const res = await api.get('/groups/user');
            setGroups(res.data);
        } catch (e) {
            console.error(e);
            alert('Error creating group');
        }
        setIsCreating(false);
    };

    const filteredUsers = allUsers.filter(u => 
        u.id !== user?.id && 
        (u.name?.toLowerCase().includes(memberSearch.toLowerCase()) || u.email?.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    const colors = ['from-teal-500 to-emerald-500', 'from-indigo-500 to-purple-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-blue-500 to-cyan-500'];

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-6 pt-24 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black">Your Groups</h1>
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Create Group
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map((g, idx) => {
                        const net = balances[g._id] || 0;
                        return (
                            <div 
                                key={g._id} 
                                onClick={() => navigate(`/group/${g._id}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[idx % colors.length]} opacity-5 rounded-bl-full`} />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center shadow-sm`}>
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold group-hover:text-teal-600 transition-colors">{g.name}</h2>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6">{g.members?.length || 0} Members</p>
                                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Balance</span>
                                        <span className={`text-lg font-black ${net > 0 ? 'text-teal-500' : net < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                            {net > 0 ? '+' : net < 0 ? '-' : ''}{formatCurrency(Math.abs(net))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {groups.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-slate-400 mb-2">No groups yet</p>
                            <p className="text-sm text-slate-400 mb-6">Create your first group to start splitting expenses</p>
                            <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-600 active:scale-95 transition-all">
                                <Plus className="h-4 w-4" /> Create Your First Group
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Group Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in" onClick={() => setIsCreateOpen(false)}>
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold text-slate-900">Create Group</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Group Name</label>
                                <input 
                                    type="text" 
                                    value={newGroupName} 
                                    onChange={e => setNewGroupName(e.target.value)} 
                                    placeholder="e.g. College Flatmates" 
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Add Members</label>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        value={memberSearch} 
                                        onChange={e => setMemberSearch(e.target.value)} 
                                        placeholder="Search by name or email..." 
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                {selectedMembers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedMembers.map(mid => {
                                            const mu = allUsers.find(u => u.id === mid);
                                            return (
                                                <span key={mid} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-700">
                                                    {mu?.name || 'Unknown'}
                                                    <button onClick={() => toggleMember(mid)} className="text-teal-400 hover:text-teal-600"><X className="h-3 w-3" /></button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-slate-100 p-2">
                                    {filteredUsers.map(u => {
                                        const isSelected = selectedMembers.includes(u.id);
                                        return (
                                            <div 
                                                key={u.id} 
                                                onClick={() => toggleMember(u.id)}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                            >
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    {u.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || '??'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-700 truncate">{u.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                                </div>
                                                {isSelected && <div className="h-5 w-5 rounded-full bg-teal-500 flex items-center justify-center"><svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
                                            </div>
                                        );
                                    })}
                                    {filteredUsers.length === 0 && <p className="text-center text-xs text-slate-400 py-4">No users found</p>}
                                </div>
                            </div>
                            <button 
                                onClick={handleCreateGroup} 
                                disabled={isCreating}
                                className="w-full rounded-xl bg-teal-500 py-4 text-white font-bold text-lg shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-60"
                            >
                                {isCreating ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
