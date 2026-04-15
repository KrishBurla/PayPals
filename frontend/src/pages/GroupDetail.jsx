import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { GroupHeader } from '../components/GroupHeader';
import { BalanceCard } from '../components/BalanceCard';
import { ExpenseLedger } from '../components/ExpenseLedger';
import { MemberDebtList } from '../components/MemberDebtList';
import { MonthlyChart, CategorySpending, QuickStats, ActivityFeed } from '../components/Analytics';
import { FloatingActions } from '../components/FloatingActions';

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { io } from 'socket.io-client';

export default function GroupDetail() {
  const { id } = useParams(); // Get group ID from URL
  const navigate = useNavigate();
  const location = useLocation();

  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
      if (location.search.includes('add=true')) {
          setIsAddOpen(true);
          // Optional: clean up the URL without triggering a reload
          window.history.replaceState({}, '', `/group/${id}`);
      }
  }, [location, id]);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settleAmounts, setSettleAmounts] = useState({});
  const handleSettleAmountChange = (key, val) => setSettleAmounts(prev => ({...prev, [key]: val}));
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoriesOptions = [
      { id: 'food', label: 'Food', icon: '🍽️' },
      { id: 'home', label: 'Housing', icon: '🏠' },
      { id: 'transport', label: 'Transport', icon: '🚗' },
      { id: 'entertainment', label: 'Entertainment', icon: '📺' },
      { id: 'custom', label: 'Custom', icon: '✨' }
  ];
  
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('food');
  const [customCategory, setCustomCategory] = useState('');
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, EXACT, PERCENTAGE
  const [splitData, setSplitData] = useState({}); // { userId: value }
  
  const { user } = useContext(AuthContext);
  const { formatCurrency, multiplier } = useContext(CurrencyContext);

  const [activeGroup, setActiveGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io('http://localhost:3006', { query: { userId: user.id } });
    
    socket.on('notification', (payload) => {
        setToastMessage(payload.type === 'settle' ? 'A balance was settled!' : 'A new expense was added!');
        setTimeout(() => setToastMessage(null), 5000);
        
        if (id) {
            api.get(`/expenses/group/${id}`).then(res => setExpenses(res.data)).catch(console.error);
            api.get(`/settlements/balances/${id}`).then(res => setBalances(res.data.balances || {})).catch(console.error);
        }
    });

    api.get('/auth/users').then(res => setAllUsers(res.data)).catch(console.error);

    if (id) {
        api.get(`/groups/${id}`).then(res => setActiveGroup(res.data)).catch(console.error);
        api.get(`/expenses/group/${id}`).then(res => setExpenses(res.data)).catch(console.error);
        api.get(`/settlements/balances/${id}`).then(res => setBalances(res.data.balances || {})).catch(console.error);
    }

    return () => socket.disconnect();
  }, [id, user]);

  useEffect(() => {
      if (activeGroup?.members && Object.keys(splitData).length === 0) {
          // Initialize split data to everyone participating by default
          const initial = {};
          activeGroup.members.forEach(m => initial[m] = '');
          setSplitData(initial);
      }
  }, [activeGroup]);

  const handleToggleSplit = (userId) => {
      setSplitData(prev => {
          const next = { ...prev };
          if (next[userId] !== undefined) delete next[userId];
          else next[userId] = '';
          return next;
      });
  };

  const handleSplitValueChange = (userId, val) => {
      setSplitData(prev => ({ ...prev, [userId]: val }));
  };

  const handleSubmitExpense = async () => {
      const amtUserInput = parseFloat(expenseAmount);
      const baseAmt = amtUserInput / multiplier;
      if (!expenseDesc || !baseAmt || Object.keys(splitData).length === 0) {
          alert('Please fill out all fields.'); return;
      }
      
      const finalCategory = expenseCategory === 'custom' ? customCategory : expenseCategory;
      let payloadParticipants = [];

      if (splitType === 'EQUAL') {
          payloadParticipants = Object.keys(splitData);
      } else if (splitType === 'EXACT') {
          payloadParticipants = Object.keys(splitData).map(uid => ({ userId: uid, exact: (parseFloat(splitData[uid]) || 0) / multiplier }));
          const sum = payloadParticipants.reduce((a, b) => a + b.exact, 0);
          if (Math.abs(sum - baseAmt) > 0.01) {
              alert(`Exact amounts sum to ${(sum * multiplier).toFixed(2)}, but total is ${amtUserInput}!`); return;
          }
      } else if (splitType === 'PERCENTAGE') {
          payloadParticipants = Object.keys(splitData).map(uid => ({ userId: uid, percent: parseFloat(splitData[uid]) || 0 }));
          const sum = payloadParticipants.reduce((a, b) => a + b.percent, 0);
          if (Math.abs(sum - 100) > 0.1) {
              alert(`Percentages sum to ${sum}%, but must be exactly 100%!`); return;
          }
      }

      try {
          await api.post('/expenses', {
              groupId: activeGroup._id,
              amount: baseAmt,
              description: expenseDesc,
              category: finalCategory,
              splitType: splitType,
              participants: payloadParticipants
          });
          setIsAddOpen(false);
          setExpenseDesc(''); setExpenseAmount(''); setSplitType('EQUAL');
          setTimeout(() => {
              api.get(`/expenses/group/${id}`).then(res => setExpenses(res.data)).catch(console.error);
              api.get(`/settlements/balances/${id}`).then(res => setBalances(res.data.balances || {})).catch(console.error);
          }, 1500); // Polling fallback in case sockets fail
      } catch (e) {
          console.error(e);
          alert('Error adding expense');
      }
  };

  const handleAddMember = async () => {
    try {
        const foundUser = allUsers.find(u => u.email === memberEmail);
        if (!foundUser) { alert("User not found!"); return; }
        await api.post(`/groups/${activeGroup._id}/members`, { userId: foundUser.id });
        setIsAddMemberOpen(false); setMemberEmail(''); window.location.reload();
    } catch(e) { console.error(e); alert('Error'); }
  };

  const refreshData = () => {
      api.get(`/expenses/group/${id}`).then(res => setExpenses(res.data)).catch(console.error);
      api.get(`/settlements/balances/${id}`).then(res => setBalances(res.data.balances || {})).catch(console.error);
  };

  const handleRemind = async (targetUserId, targetName, amount) => {
    try {
        await fetch('http://localhost:3006/remind', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUserId,
                fromUserName: user.name || user.email,
                amount,
                groupName: activeGroup?.name
            })
        });
        setToastMessage(`Reminder sent to ${targetName}!`);
        setTimeout(() => setToastMessage(null), 4000);
    } catch(e) { console.error('Remind error:', e); }
  };

  const handleSettle = async (whoOwes, whoIsOwed, amountToSettle, fullAmount) => {
    const finalAmount = amountToSettle !== undefined ? (parseFloat(amountToSettle) / multiplier) : fullAmount;
    try { 
        await api.post('/settlements/settle', { groupId: activeGroup._id, borrowerId: whoOwes, lenderId: whoIsOwed, amount: finalAmount }); 
        setIsSettleOpen(false); 
        setTimeout(refreshData, 1500); 
    } catch(e) { console.error(e); }
  };

  if (!user || !activeGroup) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="font-bold text-slate-500">Loading Group...</p></div>;

  let totalOwedToYou = 0, totalYouOwe = 0, owedPeopleCount = 0, owePeopleCount = 0;
  Object.keys(balances).forEach(key => {
      const [wO, wI] = key.split(' -> ');
      if (wO === user.id && balances[key] > 0) { totalYouOwe += balances[key]; owePeopleCount++; }
      else if (wI === user.id && balances[key] > 0) { totalOwedToYou += balances[key]; owedPeopleCount++; }
  });

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="transition-all duration-300 ease-in-out lg:ml-72">
        <div className="mx-auto max-w-[1600px] p-6 pt-24 lg:p-8 lg:pt-8">
          
          <div className="mb-6 flex items-center gap-4">
              <button onClick={() => navigate('/groups')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 md:hidden">
                  <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-black md:hidden">{activeGroup?.name}</h1>
          </div>

          <GroupHeader onAddExpense={() => setIsAddOpen(true)} onAddMember={() => setIsAddMemberOpen(true)} group={activeGroup} users={allUsers} totalExpenses={totalExpenses} />
          
          <div className="mt-8 grid gap-8 xl:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-8 xl:col-span-2">
              <BalanceCard onSettle={() => setIsSettleOpen(true)} totalOwed={totalOwedToYou} totalOwe={totalYouOwe} owedPeopleCount={owedPeopleCount} owePeopleCount={owePeopleCount} />
              <MonthlyChart rawExpenses={expenses} />
              <ExpenseLedger expenses={expenses} users={allUsers} currentUser={user} onExpenseUpdated={refreshData} />
            </div>
            <div className="flex min-w-0 flex-col gap-8 xl:col-span-1">
              <MemberDebtList onSettle={() => setIsSettleOpen(true)} onRemind={handleRemind} balances={balances} users={allUsers} currentUser={user} expenses={expenses} />
              <CategorySpending rawExpenses={expenses} />
              <QuickStats rawExpenses={expenses} currentUser={user} balances={balances} activeGroup={activeGroup} />
              <ActivityFeed rawExpenses={expenses} users={allUsers} />
            </div>
          </div>
        </div>

        <FloatingActions onAddExpense={() => setIsAddOpen(true)} onSettle={() => setIsSettleOpen(true)} />
      </main>

      {/* --- ADD EXPENSE MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}>
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in" onClick={e => e.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-900">Add Expense</h2>
                    <button onClick={() => setIsAddOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <input type="text" value={expenseDesc} onChange={e=>setExpenseDesc(e.target.value)} placeholder="e.g. Dinner" className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-teal-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 font-bold text-slate-400">{formatCurrency(0).charAt(0)}</span>
                                <input type="number" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3.5 border border-slate-200 outline-none focus:border-teal-500 rounded-xl" />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                            <div 
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-teal-500 cursor-pointer bg-white transition-all hover:bg-slate-50"
                            >
                                <span className="font-bold text-slate-700">
                                    {categoriesOptions.find(c => c.id === expenseCategory)?.icon} {categoriesOptions.find(c => c.id === expenseCategory)?.label}
                                </span>
                                <span className={`text-slate-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            {isCategoryOpen && (
                                <div className="absolute top-[80px] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden transform opacity-100 scale-100 transition-all duration-200 origin-top">
                                    {categoriesOptions.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => { setExpenseCategory(c.id); setIsCategoryOpen(false); }}
                                            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-teal-50 font-bold ${expenseCategory === c.id ? 'bg-teal-50 text-teal-700' : 'text-slate-600'}`}
                                        >
                                            {c.icon} {c.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {expenseCategory === 'custom' && (
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Custom Category Emoji & Name</label>
                            <input type="text" value={customCategory} onChange={e=>setCustomCategory(e.target.value)} placeholder="e.g. 🐶 Pet Supplies" className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-teal-500" />
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Split Logic</label>
                            <div className="flex gap-2">
                                {['EQUAL', 'EXACT', 'PERCENTAGE'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setSplitType(t)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${splitType === t ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             {activeGroup?.members?.map(id => {
                                const u = allUsers.find(au => au.id === id);
                                const nm = u ? u.name : id.substring(0,6);
                                const isChecked = splitData[id] !== undefined;
                                return (
                                <div key={id} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${isChecked?'border-teal-300 bg-teal-50/50':'border-slate-100 bg-slate-50'}`}>
                                    <div onClick={() => handleToggleSplit(id)} className="flex items-center gap-3 flex-1 cursor-pointer">
                                        <div className={`h-5 w-5 rounded border flex-shrink-0 transition-colors ${isChecked?'bg-teal-500 border-teal-500':'border-slate-300 bg-white'}`}></div>
                                        <span className={`text-sm font-bold ${isChecked?'text-slate-900':'text-slate-500'}`}>{nm}</span>
                                    </div>
                                    {isChecked && splitType === 'EXACT' && (
                                        <input type="number" placeholder="0.00" value={splitData[id]} onChange={e => handleSplitValueChange(id, e.target.value)} className="w-24 px-3 py-1.5 border rounded-lg text-sm font-bold outline-none border-teal-200 focus:border-teal-500 text-right" />
                                    )}
                                    {isChecked && splitType === 'PERCENTAGE' && (
                                        <div className="relative">
                                            <input type="number" placeholder="0" value={splitData[id]} onChange={e => handleSplitValueChange(id, e.target.value)} className="w-24 pr-8 pl-3 py-1.5 border rounded-lg text-sm font-bold outline-none border-teal-200 focus:border-teal-500 text-right" />
                                            <span className="absolute right-3 top-1.5 text-slate-400 font-bold text-sm">%</span>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                        {splitType === 'PERCENTAGE' && (
                            <p className="mt-2 text-right text-xs font-bold text-slate-400">
                                Total: {Object.values(splitData).reduce((a,b) => a + (parseFloat(b)||0), 0)}%
                            </p>
                        )}
                        {splitType === 'EXACT' && (
                            <p className="mt-2 text-right text-xs font-bold text-slate-400">
                                Total: {formatCurrency(Object.values(splitData).reduce((a,b) => a + (parseFloat(b)||0), 0) / multiplier)} / {formatCurrency((parseFloat(expenseAmount)||0) / multiplier)}
                            </p>
                        )}
                    </div>
                    <button onClick={handleSubmitExpense} className="mt-4 w-full rounded-xl bg-teal-500 py-4 text-white font-bold text-lg shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-600 active:scale-95">Add Expense</button>
                </div>
            </div>
        </div>
      )}

      {/* --- ADD MEMBER MODAL --- */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsAddMemberOpen(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-extrabold mb-4">Add Member</h2>
                <input type="text" value={memberEmail} onChange={e=>setMemberEmail(e.target.value)} placeholder="Email address" className="w-full border rounded-xl px-4 py-3 mb-4 outline-none focus:border-teal-500" />
                <button onClick={handleAddMember} className="w-full rounded-xl bg-slate-900 py-3 text-white font-bold">Invite</button>
            </div>
        </div>
      )}

      {/* --- SETTLE UP MODAL --- */}
      {isSettleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsSettleOpen(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold mb-4">Settle Up</h2>
                    <button onClick={() => setIsSettleOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button>
                </div>
                <div className="space-y-3">
                {(() => {
                    const netBals = {};
                    Object.keys(balances).forEach(key => {
                        const [whoOwes, whoIsOwed] = key.split(' -> ');
                        const amount = balances[key];
                        if (amount <= 0) return;
                        
                        let otherUserId, mult;
                        if (whoOwes === user.id) { otherUserId = whoIsOwed; mult = -1; }
                        else if (whoIsOwed === user.id) { otherUserId = whoOwes; mult = 1; }
                        else return;
                        
                        if (!netBals[otherUserId]) netBals[otherUserId] = 0;
                        netBals[otherUserId] += (amount * mult);
                    });

                    return Object.keys(netBals).map(otherUserId => {
                        const netAmount = netBals[otherUserId];
                        if (Math.abs(netAmount) < 0.01) return null;
                        
                        const direction = netAmount > 0 ? "owes_you" : "you_owe";
                        const displayAmount = Math.abs(netAmount);
                        const otherUser = allUsers.find(u => u.id === otherUserId);
                        
                        const currentInputAmount = settleAmounts[otherUserId] !== undefined ? settleAmounts[otherUserId] : (displayAmount * multiplier).toFixed(2);
                        
                        return (
                            <div key={otherUserId} className="flex flex-col gap-2 border p-3 rounded-xl border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${direction === 'you_owe' ? 'border-rose-200 bg-rose-100 text-rose-700' : 'border-teal-200 bg-teal-100 text-teal-700'}`}>
                                        {otherUser?.name ? otherUser.name.substring(0,2).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold">{otherUser?.name || "Unknown"}</p>
                                        <p className={direction==='you_owe'?'text-rose-600 font-bold text-xs':'text-teal-600 font-bold text-xs'}>{direction==='you_owe'? `you owe net ${formatCurrency(displayAmount)}` : `owes you net ${formatCurrency(displayAmount)}`}</p>
                                    </div>
                                    <div className="relative w-24">
                                        <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">{formatCurrency(0).charAt(0)}</span>
                                        <input 
                                            type="number" 
                                            value={currentInputAmount} 
                                            onChange={(e) => handleSettleAmountChange(otherUserId, e.target.value)} 
                                            className="w-full pl-7 pr-2 py-1.5 border rounded-lg text-sm font-bold outline-none border-slate-200 focus:border-teal-500" 
                                        />
                                    </div>
                                    <button onClick={() => {
                                        const borrower = direction === 'you_owe' ? user.id : otherUserId;
                                        const lender = direction === 'you_owe' ? otherUserId : user.id;
                                        handleSettle(borrower, lender, settleAmounts[otherUserId], displayAmount);
                                    }} className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm ${direction==='you_owe'?'bg-rose-500':'bg-teal-500'}`}>Settle</button>
                                </div>
                            </div>
                        )
                    });
                })()}
                </div>
            </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-4 text-white shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <p className="font-medium text-sm">{toastMessage}</p>
                <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
        </div>
      )}
    </div>
  )
}