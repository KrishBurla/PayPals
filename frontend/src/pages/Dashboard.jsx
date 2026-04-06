// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { 
    LayoutDashboard, Users, Activity, Settings, LogOut, 
    Search, Plus, Wallet, ArrowDownRight, ArrowUpRight, 
    UtensilsCrossed, Home, Car, Tv, ChevronRight, Zap, X
} from 'lucide-react';

// --- DUMMY DATA (From Claude) ---
const MEMBERS = [
  { id: 1, name: "Alex Kim", initials: "AK", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { id: 2, name: "Maria R.", initials: "MR", color: "bg-pink-100 text-pink-600 border-pink-200" },
  { id: 3, name: "James Liu", initials: "JL", color: "bg-amber-100 text-amber-600 border-amber-200" },
  { id: 4, name: "Sara Chen", initials: "SC", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
];

const TRANSACTIONS = [
  { id: 1, category: "food", icon: UtensilsCrossed, iconColor: "text-orange-500 bg-orange-100", desc: "Dinner at Olive Garden", date: "Apr 05", paidBy: "Alex Kim", yourShare: 18.50, total: 74.00, status: "owed" },
  { id: 2, category: "home", icon: Home, iconColor: "text-blue-500 bg-blue-100", desc: "Monthly Rent — Apr", date: "Apr 01", paidBy: "You", yourShare: 650.00, total: 2600.00, status: "lending" },
  { id: 3, category: "sub", icon: Tv, iconColor: "text-purple-500 bg-purple-100", desc: "Netflix Subscription", date: "Mar 31", paidBy: "Maria R.", yourShare: 4.75, total: 19.00, status: "owed" },
  { id: 4, category: "car", icon: Car, iconColor: "text-slate-500 bg-slate-100", desc: "Uber to Airport", date: "Mar 30", paidBy: "You", yourShare: 12.20, total: 36.60, status: "lending" },
  { id: 5, category: "util", icon: Zap, iconColor: "text-yellow-500 bg-yellow-100", desc: "Electric Bill", date: "Mar 28", paidBy: "James Liu", yourShare: 43.00, total: 172.00, status: "owed" },
];

const DEBTS = [
  { member: MEMBERS[0], type: "owes_you", amount: 87.30 },
  { member: MEMBERS[1], type: "you_owe", amount: 14.75 },
  { member: MEMBERS[2], type: "owes_you", amount: 34.10 },
];

export default function Dashboard() {
    const [activeNav, setActiveNav] = useState("dashboard");
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSettleOpen, setIsSettleOpen] = useState(false);

    // Calculations
    const owedToYou = DEBTS.filter(d => d.type === "owes_you").reduce((s, d) => s + d.amount, 0);
    const youOwe = DEBTS.filter(d => d.type === "you_owe").reduce((s, d) => s + d.amount, 0);
    const netBalance = owedToYou - youOwe;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            
            {/* --- SIDEBAR (Vercel Style) --- */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col">
                <div className="flex h-16 items-center px-6 border-b border-slate-200 gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white font-bold">$</div>
                    <span className="text-xl font-bold tracking-tight text-slate-800">SplitFlow</span>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {[
                        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { id: "groups", icon: Users, label: "Groups", badge: 3 },
                        { id: "activity", icon: Activity, label: "Activity" },
                        { id: "settings", icon: Settings, label: "Settings" },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeNav === item.id ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                            <item.icon className={`h-5 w-5 ${activeNav === item.id ? "text-teal-600" : "text-slate-400"}`} />
                            <span>{item.label}</span>
                            {item.badge && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">JD</div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="truncate text-sm font-bold text-slate-900">John Doe</p>
                            <p className="truncate text-xs text-slate-500">john@email.com</p>
                        </div>
                        <LogOut className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-700" />
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto">
                
                {/* Header (Claude's Density + Vercel's Look) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">Active Group</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Downtown Loft 🏙️</h1>
                        <p className="text-sm text-slate-500 mt-1">Total group spending this month: <span className="font-bold text-slate-700">$3,420.00</span></p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Avatar Pile */}
                        <div className="flex -space-x-3">
                            {MEMBERS.map((m) => (
                                <div key={m.id} className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm ${m.color}`}>
                                    {m.initials}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsAddOpen(true)} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 active:scale-95">
                            <Plus className="h-5 w-5" /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* LEFT/CENTER COLUMNS (Ledger & Balances) */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {/* Balance Card (Vercel Style) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-slate-500 mb-3"><div className="p-2 bg-emerald-50 rounded-lg"><ArrowDownRight className="h-5 w-5 text-emerald-500" /></div><span className="text-sm font-semibold">You are owed</span></div>
                                    <p className="text-3xl font-bold text-slate-900">${owedToYou.toFixed(2)}</p>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-slate-500 mb-3"><div className="p-2 bg-rose-50 rounded-lg"><ArrowUpRight className="h-5 w-5 text-rose-500" /></div><span className="text-sm font-semibold">You owe</span></div>
                                    <p className="text-3xl font-bold text-slate-900">${youOwe.toFixed(2)}</p>
                                </div>
                                <div className="p-6 bg-slate-50/50">
                                    <div className="flex items-center gap-2 text-slate-500 mb-3"><div className="p-2 bg-slate-200 rounded-lg"><Wallet className="h-5 w-5 text-slate-700" /></div><span className="text-sm font-semibold">Net Balance</span></div>
                                    <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toFixed(2)}</p>
                                    <button onClick={() => setIsSettleOpen(true)} className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95">Settle Up</button>
                                </div>
                            </div>
                        </div>

                        {/* Expense Ledger */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-slate-900">Recent Expenses</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                                </div>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {TRANSACTIONS.map((tx) => (
                                    <div key={tx.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${tx.iconColor}`}>
                                            <tx.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{tx.desc}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{tx.date} • {tx.paidBy === "You" ? "You paid" : `${tx.paidBy} paid`} ${tx.total.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 mb-1">Your share</p>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${tx.status === 'lending' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {tx.status === 'lending' ? '+' : '-'}${tx.yourShare.toFixed(2)}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Debts & Stats) */}
                    <div className="space-y-6">
                        
                        {/* Member Debts (Claude's feature) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Individual Balances</h2>
                            <div className="space-y-4">
                                {DEBTS.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border ${d.member.color}`}>{d.member.initials}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{d.member.name}</p>
                                                <p className={`text-xs ${d.type === 'owes_you' ? 'text-emerald-600' : 'text-rose-600'}`}>{d.type === 'owes_you' ? 'owes you' : 'you owe'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-base font-bold ${d.type === 'owes_you' ? 'text-emerald-600' : 'text-rose-600'}`}>${d.amount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">This Month</p>
                                <p className="text-2xl font-black text-indigo-600">24</p>
                                <p className="text-xs text-slate-500 mt-1">Total transactions</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Share</p>
                                <p className="text-2xl font-black text-amber-500">$482</p>
                                <p className="text-xs text-slate-500 mt-1">Total expenses</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* --- ADD EXPENSE MODAL --- */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsAddOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Add Expense</h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="h-5 w-5"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <input type="text" placeholder="e.g. Dinner, Uber, Rent" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                                        <input type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Paid By</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700">
                                        <option>You</option>
                                        {MEMBERS.map(m => <option key={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95">
                                Save Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}