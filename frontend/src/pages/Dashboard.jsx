import React, { useState, useContext, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CurrencyContext } from '../context/CurrencyContext';
import { AuthContext } from '../context/AuthContext';
import { ActivityFeed } from '../components/Analytics';
import { FloatingActions } from '../components/FloatingActions';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { formatCurrency } = useContext(CurrencyContext);

  const [groups, setGroups] = useState([]);
  const [isGroupSelectOpen, setIsGroupSelectOpen] = useState(false);
  const navigate = useNavigate();
  const [globalBalances, setGlobalBalances] = useState({ totalOwe: 0, totalOwed: 0, totalExpenses: 0 });
  const [allExpenses, setAllExpenses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);

    if (user?.id) {
        api.get('/groups/user').then(async res => {
            setGroups(res.data);

            let totalOweGlobal = 0;
            let totalOwedGlobal = 0;
            let totalExpensesGlobal = 0;
            let combinedExpenses = [];

            const balPromises = res.data.map(g => api.get(`/settlements/balances/${g._id}`));
            const expPromises = res.data.map(g => api.get(`/expenses/group/${g._id}`));
            
            const balResults = await Promise.all(balPromises);
            const expResults = await Promise.all(expPromises);
            
            balResults.forEach(bRes => {
                const bals = bRes.data.balances || {};
                Object.keys(bals).forEach(key => {
                    const [whoOwes, whoIsOwed] = key.split(' -> ');
                    if (whoOwes === user.id) totalOweGlobal += bals[key];
                    else if (whoIsOwed === user.id) totalOwedGlobal += bals[key];
                });
            });

            expResults.forEach((eRes, idx) => {
                const groupName = res.data[idx].name;
                eRes.data.forEach(ex => {
                    ex.groupName = groupName;
                    combinedExpenses.push(ex);
                    if (ex.paidBy === user.id) totalExpensesGlobal += ex.amount;
                });
            });

            combinedExpenses.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAllExpenses(combinedExpenses.slice(0, 15)); // Top 15 recent global expenses

            setGlobalBalances({ totalOwe: totalOweGlobal, totalOwed: totalOwedGlobal, totalExpenses: totalExpensesGlobal });
        }).catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="transition-all duration-300 ease-in-out lg:ml-72">
        <div className="mx-auto max-w-[1600px] p-6 pt-24 lg:p-8 lg:pt-8">
          
          <h1 className="text-3xl font-black mb-6">Welcome Back, {user.name ? user.name.split(' ')[0] : 'User'}! 👋</h1>

          {/* GLOBAL PORTFOLIO */}
          <div className="mb-8 p-8 md:p-10 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl"><div className="w-64 h-64 bg-teal-500 rounded-full"></div></div>
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Global Portfolio</p>
                     <h2 className="text-4xl font-black mb-1">{groups.length}</h2>
                     <p className="text-sm font-medium text-slate-500">Active Groups</p>
                 </div>
                 <div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total You're Owed</p>
                     <p className="text-4xl font-black text-teal-400">{formatCurrency(globalBalances.totalOwed)}</p>
                     <p className="text-sm font-medium text-slate-500">Across all groups</p>
                 </div>
                 <div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total You Owe</p>
                     <p className="text-4xl font-black text-rose-400">{formatCurrency(globalBalances.totalOwe)}</p>
                     <p className="text-sm font-medium text-slate-500">Across all groups</p>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                      <h2 className="text-xl font-bold mb-6">Your Lifetime Statistics</h2>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                             <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Total Handled</p>
                             <p className="text-3xl font-black text-indigo-700">{formatCurrency(globalBalances.totalExpenses)}</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-teal-50 border border-teal-100">
                             <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Items Paid For</p>
                             <p className="text-3xl font-black text-teal-700">{allExpenses.filter(e => e.paidBy === user.id).length} items</p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="xl:col-span-1">
                  <ActivityFeed rawExpenses={allExpenses} users={allUsers} isGlobal={true} />
              </div>
          </div>
        </div>
        <FloatingActions onAddExpense={() => setIsGroupSelectOpen(true)} />
      </main>

      {isGroupSelectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsGroupSelectOpen(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-slate-900">Which Group?</h2>
                    <button onClick={() => setIsGroupSelectOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {groups.map(g => (
                        <button key={g._id} onClick={() => navigate(`/group/${g._id}?add=true`)} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50 transition-colors flex items-center justify-between group-btn">
                            <span className="font-bold text-slate-700">{g.name}</span>
                            <span className="text-slate-400">→</span>
                        </button>
                    ))}
                    {groups.length === 0 && <p className="text-sm text-slate-500 text-center py-4">You are not in any groups yet.</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  )
}