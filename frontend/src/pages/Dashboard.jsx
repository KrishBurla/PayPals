import React, { useState, useContext, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { CurrencyContext } from '../context/CurrencyContext';
import { AuthContext } from '../context/AuthContext';
import { ActivityFeed } from '../components/Analytics';
import { FloatingActions } from '../components/FloatingActions';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Receipt, Mail, Check, X as CloseIcon } from "lucide-react";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { formatCurrency } = useContext(CurrencyContext);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io('http://localhost:3006', { query: { userId: user.id } });
    
    socket.on('notification', (data) => {
        toast.success(data.message || 'New notification', {
            style: {
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '16px',
            },
            icon: '💸'
        });
    });

    socket.on('group_invite', (data) => {
        toast.success(data.message || 'New Group Invite!', {
            style: {
                background: '#4f46e5',
                color: '#ffffff',
                borderRadius: '16px',
            },
            icon: '📬'
        });
        // Refresh invites list
        api.get('/groups/invites').then(res => setInvites(res.data)).catch(console.error);
    });

    return () => socket.disconnect();
  }, [user]);

  const [groups, setGroups] = useState([]);
  const [isGroupSelectOpen, setIsGroupSelectOpen] = useState(false);
  const navigate = useNavigate();
  const [globalBalances, setGlobalBalances] = useState({ totalOwe: 0, totalOwed: 0, totalExpenses: 0 });
  const [allExpenses, setAllExpenses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [expandedFriendId, setExpandedFriendId] = useState(null);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);
    api.get('/groups/invites').then(res => setInvites(res.data)).catch(console.error);

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

            const netUserBals = {};

            balResults.forEach((bRes, idx) => {
                const groupName = res.data[idx].name;
                const bals = bRes.data.balances || {};
                Object.keys(bals).forEach(key => {
                    const [whoOwes, whoIsOwed] = key.split(' -> ');
                    const amount = bals[key];
                    if (amount <= 0) return;
                    
                    let otherUserId = null;
                    let amountNet = 0;
                    if (whoOwes === user.id) {
                        otherUserId = whoIsOwed;
                        amountNet = -amount;
                        totalOweGlobal += amount;
                    } else if (whoIsOwed === user.id) {
                        otherUserId = whoOwes;
                        amountNet = amount;
                        totalOwedGlobal += amount;
                    } else {
                        return;
                    }

                    if (!netUserBals[otherUserId]) netUserBals[otherUserId] = { net: 0, breakdowns: [] };
                    netUserBals[otherUserId].net += amountNet;
                    netUserBals[otherUserId].breakdowns.push({ groupName, amount: amountNet, isNegative: amountNet < 0 });
                });
            });

            // Convert to friends array
            const friendsBalances = Object.keys(netUserBals).map(uid => ({
                id: uid,
                net: netUserBals[uid].net,
                breakdowns: netUserBals[uid].breakdowns
            })).filter(f => Math.abs(f.net) > 0.01);

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

            setGlobalBalances({ 
                totalOwe: totalOweGlobal, 
                totalOwed: totalOwedGlobal, 
                totalExpenses: totalExpensesGlobal,
                friends: friendsBalances
            });
        }).catch(console.error);
    }
  }, [user]);

  const handleAcceptInvite = async (inviteId) => {
    try {
        await api.post(`/groups/invites/${inviteId}/accept`);
        toast.success("Joined group!");
        // Refresh groups and invites
        api.get('/groups/user').then(async res => setGroups(res.data));
        setInvites(invites.filter(i => i._id !== inviteId));
        // Force a total refresh of balances by triggering the main useEffect if needed, 
        // or just window.location.reload() for simplicity in a heavy data component
        setTimeout(() => window.location.reload(), 500);
    } catch (err) {
        toast.error("Failed to accept invite");
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
        await api.post(`/groups/invites/${inviteId}/decline`);
        toast.success("Invite declined");
        setInvites(invites.filter(i => i._id !== inviteId));
    } catch (err) {
        toast.error("Failed to decline invite");
    }
  };

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

          {/* PENDING INVITES SECTION */}
          {invites.length > 0 && (
            <div className="mb-8 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    <h2 className="text-xl font-bold">Group Invitations ({invites.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {invites.map(invite => (
                        <div key={invite._id} className="p-6 rounded-3xl border border-indigo-100 bg-white shadow-sm ring-1 ring-indigo-50 flex flex-col justify-between animate-in">
                            <div>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">New Invitation</p>
                                <h3 className="text-lg font-black text-slate-900 mb-2">{invite.groupName}</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    <span className="font-bold text-slate-900">{invite.inviterName || 'Someone'}</span> invited you to join this group.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAcceptInvite(invite._id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95"
                                >
                                    <Check className="h-4 w-4" /> Accept
                                </button>
                                <button 
                                    onClick={() => handleDeclineInvite(invite._id)}
                                    className="flex items-center justify-center px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                  {/* OVERALL FRIEND/USER BALANCES (Added per Request) */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                      <h2 className="text-xl font-bold mb-6">Friends Overall Balance</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {globalBalances.friends?.length > 0 ? (
                              globalBalances.friends.map(f => {
                                  const friendUser = allUsers.find(u => u.id === f.id);
                                  const name = friendUser?.name || "Unknown";
                                  const initials = name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                                  const owesYou = f.net > 0;
                                  const isExpanded = expandedFriendId === f.id;
                                  
                                  return (
                                      <div key={f.id} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors overflow-hidden">
                                          <div className="flex items-center justify-between p-4">
                                              <div className="flex items-center gap-3">
                                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border shadow-sm ${owesYou ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                                      {initials}
                                                  </div>
                                                  <div>
                                                      <p className="text-sm font-bold text-slate-900">{name}</p>
                                                      <p className={`text-xs font-semibold ${owesYou ? 'text-teal-600' : 'text-rose-600'}`}>{owesYou ? 'owes you net' : 'you owe net'}</p>
                                                  </div>
                                              </div>
                                              <p className={`text-lg font-black ${owesYou ? 'text-teal-600' : 'text-rose-600'}`}>
                                                  {formatCurrency(Math.abs(f.net))}
                                              </p>
                                          </div>
                                          
                                          <div className="px-4 pb-4">
                                              <button 
                                                  onClick={() => setExpandedFriendId(isExpanded ? null : f.id)} 
                                                  className="w-full flex items-center justify-center gap-1.5 rounded-lg h-8 text-[11px] font-bold border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-all"
                                              >
                                                  Breakdown {isExpanded ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                                              </button>
                                          </div>

                                          {isExpanded && (
                                              <div className="border-t border-slate-100 bg-slate-100/50 p-4">
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Per-Group Net Math</p>
                                                  <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 max-h-[120px] overflow-y-auto">
                                                      {f.breakdowns.map((r, i) => (
                                                          <div key={i} className="flex justify-between items-center text-xs">
                                                              <span className="font-semibold text-slate-700 truncate max-w-[150px]">{r.groupName}</span>
                                                              <span className={`font-bold ${r.isNegative ? 'text-rose-600' : 'text-teal-600'}`}>
                                                                  {r.isNegative ? '-' : '+'}{formatCurrency(Math.abs(r.amount))}
                                                              </span>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  );
                              })
                          ) : (
                              <p className="text-sm text-slate-500 font-medium">You are all settled up with everyone across all groups! 🎉</p>
                          )}
                      </div>
                  </div>

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