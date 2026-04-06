// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { 
    LayoutDashboard, Users, Activity, Settings, LogOut, 
    Search, Plus, Wallet, ArrowDownRight, ArrowUpRight, 
    UtensilsCrossed, Home, Car, Tv, ChevronRight, Zap, X, ShoppingCart
} from 'lucide-react';

// --- DATA EXTRACTED FROM CLAUDE ---
const MEMBERS = [
  { id: 1, name: "Alex Kim", initials: "AK", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { id: 2, name: "Maria R.", initials: "MR", color: "bg-pink-100 text-pink-600 border-pink-200" },
  { id: 3, name: "James Liu", initials: "JL", color: "bg-amber-100 text-amber-600 border-amber-200" },
  { id: 4, name: "Sara Chen", initials: "SC", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
];

const TRANSACTIONS = [
  { id: 1, category: "food", icon: UtensilsCrossed, iconColor: "text-orange-600 bg-orange-100", desc: "Dinner at Olive Garden", date: "Apr 05", paidBy: "Alex Kim", yourShare: 18.50, total: 74.00, split: 4, status: "owed" },
  { id: 2, category: "home", icon: Home, iconColor: "text-blue-600 bg-blue-100", desc: "Monthly Rent — Apr", date: "Apr 01", paidBy: "You", yourShare: 650.00, total: 2600.00, split: 4, status: "lending" },
  { id: 3, category: "sub", icon: Tv, iconColor: "text-purple-600 bg-purple-100", desc: "Netflix Subscription", date: "Mar 31", paidBy: "Maria R.", yourShare: 4.75, total: 19.00, split: 4, status: "owed" },
  { id: 4, category: "car", icon: Car, iconColor: "text-slate-600 bg-slate-100", desc: "Uber to Airport", date: "Mar 30", paidBy: "You", yourShare: 12.20, total: 36.60, split: 3, status: "lending" },
  { id: 5, category: "food", icon: ShoppingCart, iconColor: "text-emerald-600 bg-emerald-100", desc: "Trader Joe's Groceries", date: "Mar 25", paidBy: "Sara Chen", yourShare: 22.40, total: 89.60, split: 4, status: "owed" },
  { id: 6, category: "home", icon: Zap, iconColor: "text-yellow-600 bg-yellow-100", desc: "Electric Bill — March", date: "Mar 27", paidBy: "You", yourShare: 43.00, total: 172.00, split: 4, status: "lending" },
];

const DEBTS = [
  { member: MEMBERS[0], type: "owes_you", amount: 87.30 },
  { member: MEMBERS[2], type: "owes_you", amount: 34.10 },
  { member: MEMBERS[3], type: "you_owe", amount: 59.90 },
  { member: MEMBERS[1], type: "you_owe", amount: 14.75 },
];

const MONTHLY_DATA = [
  { m: "Nov", v: 1840 }, { m: "Dec", v: 2210 }, { m: "Jan", v: 1670 },
  { m: "Feb", v: 2890 }, { m: "Mar", v: 3100 }, { m: "Apr", v: 3420 }
];

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState("dashboard");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    
    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSettleOpen, setIsSettleOpen] = useState(false);

    // Calculations
    const owedToYou = DEBTS.filter(d => d.type === "owes_you").reduce((s, d) => s + d.amount, 0);
    const youOwe = DEBTS.filter(d => d.type === "you_owe").reduce((s, d) => s + d.amount, 0);
    const netBalance = owedToYou - youOwe;
    const maxV = Math.max(...MONTHLY_DATA.map(d => d.v));

    // Filters
    const filteredTransactions = TRANSACTIONS.filter(t => {
        const matchesSearch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.paidBy.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === "All" || t.category === categoryFilter.toLowerCase();
        return matchesSearch && matchesCat;
    });

    return (
        // THE FIX: Strict flex container to prevent overlap
        <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 h-full flex flex-col z-10 hidden lg:flex">
                <div className="flex h-20 items-center px-6 gap-3 border-b border-slate-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white font-bold">$</div>
                    <span className="text-xl font-bold tracking-tight text-slate-800">SplitFlow</span>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    {[
                        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { id: "groups", icon: Users, label: "Groups", badge: 3 },
                        { id: "activity", icon: Activity, label: "Activity" },
                        { id: "settings", icon: Settings, label: "Settings" },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${activeNav === item.id ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                            <item.icon className={`h-5 w-5 ${activeNav === item.id ? "text-teal-600" : "text-slate-400"}`} />
                            <span>{item.label}</span>
                            {item.badge && <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white px-1.5">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">JD</div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="truncate text-sm font-bold text-slate-900">John Doe</p>
                            <p className="truncate text-xs text-slate-500">john@email.com</p>
                        </div>
                        <LogOut className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 h-full overflow-y-auto">
                <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                    
                    {/* Header (Claude's data, Vercel's look) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-teal-50 text-teal-600 border border-teal-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Active Group</span>
                                <span className="bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full">{MEMBERS.length + 1} members</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Downtown Loft 🏙️</h1>
                            <p className="text-sm text-slate-500 mt-2">Total group spending this month: <span className="font-bold text-slate-900">$3,420.00</span></p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {MEMBERS.map((m) => (
                                    <div key={m.id} title={m.name} className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm ${m.color}`}>
                                        {m.initials}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setIsAddOpen(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 active:scale-95">
                                <Plus className="h-5 w-5" /> Add Expense
                            </button>
                        </div>
                    </div>

                    {/* TWO-COLUMN GRID LAYOUT (The fix for Claude's grid) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        {/* LEFT COLUMN (8 cols wide on desktop) */}
                        <div className="xl:col-span-8 space-y-8">
                            
                            {/* Balance Card */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    <div className="p-6 lg:p-8">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <ArrowDownRight className="h-5 w-5 text-emerald-500 bg-emerald-50 rounded-lg p-0.5" />
                                            <span className="text-sm font-semibold">You are owed</span>
                                        </div>
                                        <p className="text-4xl font-extrabold text-emerald-500 tracking-tight">${owedToYou.toFixed(2)}</p>
                                        <p className="text-xs text-emerald-600/70 mt-2 font-medium bg-emerald-50 inline-block px-2 py-1 rounded-md">From {DEBTS.filter(d => d.type === "owes_you").length} members</p>
                                    </div>
                                    <div className="p-6 lg:p-8">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <ArrowUpRight className="h-5 w-5 text-rose-500 bg-rose-50 rounded-lg p-0.5" />
                                            <span className="text-sm font-semibold">You owe</span>
                                        </div>
                                        <p className="text-4xl font-extrabold text-rose-500 tracking-tight">${youOwe.toFixed(2)}</p>
                                        <p className="text-xs text-rose-600/70 mt-2 font-medium bg-rose-50 inline-block px-2 py-1 rounded-md">To {DEBTS.filter(d => d.type === "you_owe").length} members</p>
                                    </div>
                                    <div className="p-6 lg:p-8 bg-slate-50/50 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <Wallet className="h-5 w-5 text-slate-700 bg-slate-200 rounded-lg p-0.5" />
                                            <span className="text-sm font-semibold">Net Balance</span>
                                        </div>
                                        <p className={`text-4xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {netBalance >= 0 ? '+' : '−'}${Math.abs(netBalance).toFixed(2)}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => setIsSettleOpen(true)} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-sm">Settle Up</button>
                                            <button className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition-all text-sm">Remind</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Spending Chart (Extracted from Claude) */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Monthly Group Spending</h2>
                                        <p className="text-sm text-slate-500">Last 6 months</p>
                                    </div>
                                    <span className="bg-teal-50 border border-teal-100 text-teal-600 text-xs font-bold px-3 py-1.5 rounded-full">+12% vs last month</span>
                                </div>
                                <div className="flex items-end justify-between h-36 gap-2">
                                    {MONTHLY_DATA.map((d, i) => {
                                        const h = Math.round((d.v / maxV) * 100);
                                        const isCurrent = i === MONTHLY_DATA.length - 1;
                                        return (
                                            <div key={d.m} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                                <span className={`text-xs font-bold transition-opacity ${isCurrent ? 'text-slate-700 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>${(d.v/1000).toFixed(1)}k</span>
                                                <div className="w-full relative h-full flex items-end rounded-t-xl overflow-hidden bg-slate-50">
                                                    <div style={{ height: `${h}%` }} className={`w-full rounded-t-xl transition-all duration-500 ${isCurrent ? 'bg-teal-500' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                                                </div>
                                                <span className={`text-xs font-bold ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`}>{d.m}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Expense Ledger with Tabs (Extracted from Claude) */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 lg:px-8 border-b border-slate-100">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Expense Ledger</h2>
                                            <p className="text-sm text-slate-500">{filteredTransactions.length} transactions</p>
                                        </div>
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                                        </div>
                                    </div>
                                    {/* Claude's Filter Tabs */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {["All", "Food", "Home", "Car", "Sub"].map(f => (
                                            <button key={f} onClick={() => setCategoryFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${categoryFilter === f ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'}`}>
                                                {f === "Sub" ? "Subscriptions" : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="divide-y divide-slate-50">
                                    {filteredTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center gap-4 p-5 lg:px-8 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${tx.iconColor}`}>
                                                <tx.icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{tx.desc}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Split {tx.split} ways • ${tx.total.toFixed(2)} total</p>
                                            </div>
                                            <div className="hidden sm:block text-right pr-4">
                                                <p className="text-xs text-slate-500 mb-0.5">{tx.date}</p>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tx.paidBy === 'You' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {tx.paidBy} paid
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 mb-1">Your share</p>
                                                <span className={`text-sm font-bold ${tx.status === 'lending' ? 'text-slate-400' : 'text-rose-500'}`}>
                                                    {tx.status === 'lending' ? '' : '−'}${tx.yourShare.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <div className="p-10 text-center text-slate-500 text-sm font-medium">No transactions match your filters.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (4 cols wide on desktop) */}
                        <div className="xl:col-span-4 space-y-8">
                            
                            {/* Member Balances */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Member Balances</h2>
                                <p className="text-sm text-slate-500 mb-5">Individual debt breakdown</p>
                                <div className="space-y-4">
                                    {DEBTS.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border ${d.member.color}`}>{d.member.initials}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{d.member.name}</p>
                                                    <p className={`text-xs font-medium ${d.type === 'owes_you' ? 'text-emerald-600' : 'text-rose-600'}`}>{d.type === 'owes_you' ? 'owes you' : 'you owe'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <p className={`text-base font-bold ${d.type === 'owes_you' ? 'text-emerald-500' : 'text-rose-500'}`}>${d.amount.toFixed(2)}</p>
                                                <button className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${d.type === 'owes_you' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'}`}>
                                                    {d.type === 'owes_you' ? 'Remind' : 'Pay'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Spending By Category Progress Bars (Claude's logic) */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Spending by Category</h2>
                                <p className="text-sm text-slate-500 mb-6">This month</p>
                                <div className="space-y-5">
                                    {[
                                        { label: "Housing", icon: "🏠", color: "bg-blue-500 text-blue-500", pct: 62, amt: 2772 },
                                        { label: "Food & Dining", icon: "🍽️", color: "bg-orange-500 text-orange-500", pct: 25, amt: 1118 },
                                        { label: "Transport", icon: "🚗", color: "bg-purple-500 text-purple-500", pct: 8, amt: 357 },
                                        { label: "Subscriptions", icon: "📺", color: "bg-emerald-500 text-emerald-500", pct: 5, amt: 223 },
                                    ].map(cat => (
                                        <div key={cat.label}>
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{cat.icon}</span>
                                                    <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500 font-medium">${cat.amt.toLocaleString()}</span>
                                                    <span className={`text-xs font-black w-8 text-right ${cat.color.split(' ')[1]}`}>{cat.pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${cat.color.split(' ')[0]} rounded-full`} style={{ width: `${cat.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Avg / Person", value: `$${(3420 / 5).toFixed(0)}`, color: "text-teal-600", sub: "this month" },
                                    { label: "Transactions", value: TRANSACTIONS.length, color: "text-blue-600", sub: "this month" },
                                    { label: "Settled", value: "82%", color: "text-orange-600", sub: "of balances" },
                                    { label: "Days active", value: "247", color: "text-purple-600", sub: "with group" },
                                ].map(stat => (
                                    <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className={`text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Activity Feed */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Activity Feed</h2>
                                <p className="text-sm text-slate-500 mb-5">Recent group actions</p>
                                <div className="space-y-4">
                                    {[
                                        { text: "Alex Kim added Olive Garden dinner", time: "2h ago", dot: "bg-indigo-500" },
                                        { text: "Maria R. paid Netflix for the group", time: "1d ago", dot: "bg-pink-500" },
                                        { text: "Sara Chen settled $59.90 with you", time: "2d ago", dot: "bg-emerald-500" },
                                        { text: "James Liu added Starbucks round", time: "3d ago", dot: "bg-amber-500" },
                                    ].map((a, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 leading-snug">{a.text}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- SETTLE UP MODAL (From Claude) --- */}
            {isSettleOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsSettleOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900">Settle Up</h2>
                            <button onClick={() => setIsSettleOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="h-5 w-5"/></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Choose who you want to settle with:</p>
                        <div className="space-y-3 mb-6">
                            {DEBTS.map(d => (
                                <div key={d.member.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border ${d.member.color}`}>{d.member.initials}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{d.member.name}</p>
                                        <p className={`text-xs font-medium ${d.type === 'owes_you' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {d.type === 'owes_you' ? `owes you $${d.amount.toFixed(2)}` : `you owe $${d.amount.toFixed(2)}`}
                                        </p>
                                    </div>
                                    <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${d.type === 'owes_you' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                        {d.type === 'owes_you' ? 'Remind' : 'Pay'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsSettleOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95">
                            Settle All Debts
                        </button>
                    </div>
                </div>
            )}

            {/* --- ADD EXPENSE MODAL (From Claude with Checkboxes) --- */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-900">Add Expense</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <input type="text" placeholder="e.g. Dinner at Olive Garden" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-medium text-slate-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                                        <input type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-slate-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                    <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-slate-700 appearance-none">
                                        <option>🍽️ Food</option>
                                        <option>🏠 Housing</option>
                                        <option>🚗 Transport</option>
                                        <option>📺 Subscriptions</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paid By</label>
                                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 appearance-none">
                                    <option>You</option>
                                    {MEMBERS.map(m => <option key={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Split Between</label>
                                <div className="flex flex-wrap gap-3">
                                    {["You", ...MEMBERS.map(m => m.name.split(" ")[0])].map(name => (
                                        <label key={name} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-500 rounded border-slate-300 focus:ring-teal-500" />
                                            <span className="text-sm font-bold text-slate-700">{name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="w-full mt-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95 text-lg">
                                Add Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}