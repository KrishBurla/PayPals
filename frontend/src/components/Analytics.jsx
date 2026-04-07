import React from 'react';

export function MonthlyChart() {
    const data = [ { m: "Nov", v: 1840 }, { m: "Dec", v: 2210 }, { m: "Jan", v: 1670 }, { m: "Feb", v: 2890 }, { m: "Mar", v: 3100 }, { m: "Apr", v: 3420 } ];
    const maxV = Math.max(...data.map(d => d.v));
    
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Monthly Spending</h3>
                    <p className="text-sm text-slate-500">Last 6 months</p>
                </div>
                <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-600">+12% vs last month</span>
            </div>
            <div className="flex h-36 items-end justify-between gap-2">
                {data.map((d, i) => {
                    const h = Math.round((d.v / maxV) * 100);
                    const isCurrent = i === data.length - 1;
                    return (
                        <div key={d.m} className="group flex flex-1 cursor-pointer flex-col items-center gap-2">
                            <span className={`text-xs font-bold transition-opacity ${isCurrent ? 'text-slate-700 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>${(d.v/1000).toFixed(1)}k</span>
                            <div className="flex h-full w-full items-end overflow-hidden rounded-t-xl bg-slate-50">
                                <div style={{ height: `${h}%` }} className={`w-full rounded-t-xl transition-all duration-500 ${isCurrent ? 'bg-teal-500' : 'bg-slate-200 group-hover:bg-slate-300'}`} />
                            </div>
                            <span className={`text-xs font-bold ${isCurrent ? 'text-teal-600' : 'text-slate-400'}`}>{d.m}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export function CategorySpending() {
    const categories = [
        { label: "Housing", icon: "🏠", color: "bg-blue-500 text-blue-500", pct: 62, amt: 2772 },
        { label: "Food", icon: "🍽️", color: "bg-orange-500 text-orange-500", pct: 25, amt: 1118 },
        { label: "Transport", icon: "🚗", color: "bg-purple-500 text-purple-500", pct: 8, amt: 357 },
        { label: "Subs", icon: "📺", color: "bg-emerald-500 text-emerald-500", pct: 5, amt: 223 },
    ];
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-lg font-bold text-slate-900">Spending by Category</h3>
            <p className="mb-6 text-sm text-slate-500">This month</p>
            <div className="space-y-5">
                {categories.map(cat => (
                    <div key={cat.label}>
                        <div className="mb-2 flex items-end justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{cat.icon}</span>
                                <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500">${cat.amt.toLocaleString()}</span>
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

export function QuickStats() {
    const stats = [
        { label: "Avg / Person", value: "$651", color: "text-teal-600", sub: "this month" },
        { label: "Transactions", value: "24", color: "text-blue-600", sub: "this month" },
        { label: "Settled", value: "82%", color: "text-orange-600", sub: "of balances" },
        { label: "Days active", value: "247", color: "text-purple-600", sub: "with group" },
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

export function ActivityFeed() {
    const activities = [
        { text: "Alex added Olive Garden dinner", time: "2h ago", dot: "bg-indigo-500" },
        { text: "Maria paid Netflix for group", time: "1d ago", dot: "bg-pink-500" },
        { text: "Sara settled $59.90 with you", time: "2d ago", dot: "bg-teal-500" },
        { text: "James added Starbucks round", time: "3d ago", dot: "bg-amber-500" },
    ];
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-lg font-bold text-slate-900">Activity Feed</h3>
            <p className="mb-5 text-sm text-slate-500">Recent group actions</p>
            <div className="space-y-4">
                {activities.map((a, i) => (
                    <div key={i} className="flex gap-4">
                        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                        <div>
                            <p className="text-sm font-medium leading-snug text-slate-700">{a.text}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}