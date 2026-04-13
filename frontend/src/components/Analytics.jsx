import React, { useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';

export function MonthlyChart({ rawExpenses = [] }) {
    const { formatCurrency } = useContext(CurrencyContext);
    
    // Build last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ 
            m: d.toLocaleString('default', { month: 'short' }), 
            y: d.getFullYear(), 
            mo: d.getMonth(), 
            v: 0 
        });
    }

    rawExpenses.forEach(ex => {
        if (!ex.createdAt) return;
        const d = new Date(ex.createdAt);
        if (isNaN(d.getTime())) return;
        const match = months.find(m => m.y === d.getFullYear() && m.mo === d.getMonth());
        if (match) match.v += Number(ex.amount || 0);
    });

    const maxV = Math.max(...months.map(d => d.v), 1); // prevent div by zero
    
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Monthly Spending</h3>
                    <p className="text-sm text-slate-500">Last 6 months</p>
                </div>
                {/* Dynamically calculate vs last month if we want, or just hide the pill for now */}
            </div>
            <div className="flex h-36 items-end justify-between gap-2">
                {months.map((d, i) => {
                    const h = Math.round((d.v / maxV) * 100);
                    const isCurrent = i === months.length - 1;
                    return (
                        <div key={i} className="group flex flex-1 cursor-pointer flex-col items-center gap-2 relative">
                            <span className={`text-xs font-bold transition-opacity whitespace-nowrap absolute -top-6 ${isCurrent ? 'text-slate-700 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                                {formatCurrency(d.v)}
                            </span>
                            <div className="relative h-full w-full overflow-hidden rounded-t-xl bg-slate-50">
                                <div style={{ height: `${h}%` }} className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ${isCurrent ? 'bg-teal-500' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                            </div>
                            <span className={`text-xs font-bold ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`}>{d.m}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export function CategorySpending({ rawExpenses = [] }) {
    const { formatCurrency } = useContext(CurrencyContext);
    const catMap = {
        food: { label: "Food", icon: "🍽️", color: "bg-orange-500 text-orange-500", amt: 0 },
        home: { label: "Housing", icon: "🏠", color: "bg-blue-500 text-blue-500", amt: 0 },
        transport: { label: "Transport", icon: "🚗", color: "bg-purple-500 text-purple-500", amt: 0 },
        entertainment: { label: "Entertainment", icon: "📺", color: "bg-emerald-500 text-emerald-500", amt: 0 },
        // other custom categories will fall back to gray
    };

    let total = 0;
    rawExpenses.forEach(ex => {
        const c = ex.category?.toLowerCase() || 'other';
        if (!catMap[c]) {
            catMap[c] = { label: ex.category || "Other", icon: "✨", color: "bg-slate-500 text-slate-500", amt: 0 };
        }
        catMap[c].amt += ex.amount;
        total += ex.amount;
    });

    const categories = Object.values(catMap)
        .filter(c => c.amt > 0)
        .map(c => ({ ...c, pct: total ? Math.round((c.amt / total) * 100) : 0 }))
        .sort((a,b) => b.amt - a.amt);

    if (categories.length === 0) return null;

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-lg font-bold text-slate-900">Spending by Category</h3>
            <p className="mb-6 text-sm text-slate-500">All time breakdown</p>
            <div className="space-y-5">
                {categories.map(cat => (
                    <div key={cat.label}>
                        <div className="mb-2 flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{cat.icon}</span>
                                <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500">{formatCurrency(cat.amt)}</span>
                                <span className={`w-8 text-right text-xs font-black ${cat.color.split(' ')[1]}`}>{cat.pct}%</span>
                            </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${cat.color.split(' ')[0]}`} style={{ width: `${cat.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function QuickStats({ rawExpenses = [], balances = {}, currentUser, activeGroup }) {
    const { formatCurrency } = useContext(CurrencyContext);
    
    // Avg per person
    const total = rawExpenses.reduce((a,b) => a + b.amount, 0);
    const mCount = activeGroup?.members?.length || 1;
    const avg = total / mCount;

    // Highest balance
    let maxOwe = 0;
    Object.keys(balances).forEach(k => {
        if (balances[k] > maxOwe) maxOwe = balances[k];
    });

    const stats = [
        { label: "Avg / Person", value: formatCurrency(avg), color: "text-teal-600", sub: "lifetime" },
        { label: "Transactions", value: rawExpenses.length, color: "text-blue-600", sub: "total entries" },
        { label: "Max Debt", value: formatCurrency(maxOwe), color: "text-rose-600", sub: "between two members" },
        { label: "Days active", value: activeGroup ? Math.max(1, Math.floor((new Date() - new Date(activeGroup.createdAt)) / 86400000)) : 1, color: "text-purple-600", sub: "with group" },
    ];
    return (
        <div className="grid grid-cols-2 gap-3">
            {stats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                    <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>
                </div>
            ))}
        </div>
    )
}

function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

export function ActivityFeed({ rawExpenses = [], users = [], isGlobal = false }) {
    const { formatCurrency } = useContext(CurrencyContext);
    
    // Sort expenses latest first
    const sorted = [...rawExpenses].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);

    if (sorted.length === 0) return null;

    const colors = ["bg-indigo-500", "bg-pink-500", "bg-teal-500", "bg-amber-500"];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{isGlobal ? "Global Activity Feed" : "Group Activity"}</h3>
            <p className="mb-5 text-sm text-slate-500">Recent actions</p>
            <div className="space-y-5">
                {sorted.map((ex, i) => {
                    const poster = users.find(u => u.id === ex.paidBy);
                    let text = `${poster ? poster.name.split(' ')[0] : 'Someone'} added ${ex.description} for ${formatCurrency(ex.amount)}`;
                    if (isGlobal && ex.groupName) text += ` in ${ex.groupName}`;
                    
                    return (
                        <div key={ex._id || i} className="flex gap-4 items-start">
                            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[i % colors.length]}`} />
                            <div>
                                <p className="text-sm font-medium leading-snug text-slate-700">{text}</p>
                                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(ex.createdAt)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}