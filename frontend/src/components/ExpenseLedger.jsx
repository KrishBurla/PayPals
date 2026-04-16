import { useCurrency } from '../context/CurrencyContext';
import React, { useState } from "react"
import { UtensilsCrossed, Home, Car, Tv, ShoppingBag, Zap, Search, ChevronRight, X, Pencil, Save } from "lucide-react"
import api from '../services/api';

const categoryIcons = {
  food: { icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-100", label: "Food" },
  home: { icon: Home, color: "text-blue-500", bg: "bg-blue-100", label: "Housing" },
  transport: { icon: Car, color: "text-purple-500", bg: "bg-purple-100", label: "Transport" },
  car: { icon: Car, color: "text-slate-500", bg: "bg-slate-100", label: "Transport" },
  entertainment: { icon: Tv, color: "text-emerald-500", bg: "bg-emerald-100", label: "Entertainment" },
  shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-100", label: "Shopping" },
  utilities: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100", label: "Utilities" },
}

export function ExpenseLedger({ expenses = [], users = [], currentUser, onExpenseUpdated }) {
  const { formatCurrency, currency } = useCurrency();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', amount: '', category: '' });
  const [isSaving, setIsSaving] = useState(false);
  const filterTabs = ["All", "Food", "Home", "Transport", "Entertainment"];

  const filtered = expenses.filter(ex => {
      const matchesSearch = ex.description.toLowerCase().includes(search.toLowerCase());
      let cCat = (ex.category || "food").replace(/[^\u0000-\uFFFF]/g, "").trim().toLowerCase();
      const matchesFilter = filter === "All" || cCat.includes(filter.toLowerCase());
      return matchesSearch && matchesFilter;
  });
  
  const formattedExpenses = filtered.map(ex => {
       const u = users.find(usr => usr.id === ex.paidBy);
       const name = u?.name || "Unknown";
       const isYou = ex.paidBy === currentUser.id;
       const initials = name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
       const yourSplit = ex.splits?.find(s => s.userId === currentUser.id);
       
       let status = "none";
       let yourShare = yourSplit ? yourSplit.amountOwed : 0;
       
       if (isYou) status = "lending";
       else if (yourSplit) status = "owed";
       
       return {
          id: ex._id,
          raw: ex,
          category: (ex.category||"food").replace(/[^\u0000-\uFFFF]/g, "").trim().toLowerCase(),
          description: ex.description,
          date: new Date(ex.createdAt).toLocaleDateString(),
          fullDate: new Date(ex.createdAt).toLocaleString(),
          paidBy: isYou ? "You" : name,
          paidByName: name,
          initials,
          color: isYou ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600",
          total: ex.amount,
          yourShare,
          status,
          splits: ex.splits || [],
          splitType: ex.splitType
       };
  });

  const openDetail = (expense) => {
    setSelectedExpense(expense);
    setIsEditing(false);
    setEditForm({ description: expense.description, amount: expense.total, category: expense.category });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await api.put(`/expenses/${selectedExpense.id}`, {
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        category: editForm.category
      });
      setIsEditing(false);
      setSelectedExpense(null);
      if (onExpenseUpdated) onExpenseUpdated();
    } catch (e) {
      console.error('Error updating expense:', e);
      alert('Failed to update expense');
    }
    setIsSaving(false);
  };

  return (
    <>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-bold text-slate-900">Expense Ledger</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
              {filterTabs.map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${filter === f ? 'border border-teal-200 bg-teal-50 text-teal-600' : 'border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      {f}
                  </button>
              ))}
          </div>
      </div>

      <div className="divide-y divide-slate-50">
        {formattedExpenses.map((expense) => {
          const categoryData = categoryIcons[expense.category] || categoryIcons.food;
          const Icon = categoryData.icon;
          return (
            <div key={expense.id} onClick={() => openDetail(expense)} className="group flex cursor-pointer items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${categoryData.bg}`}>
                <Icon className={`h-6 w-6 ${categoryData.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{expense.description}</p>
                <p className="mt-0.5 text-xs text-slate-500">{expense.date}</p>
              </div>
              <div className="hidden min-w-[140px] items-center gap-3 sm:flex">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${expense.color}`}>{expense.initials}</div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-500">{expense.paidBy === "You" ? "You paid" : `${expense.paidBy.split(' ')[0]} paid`}</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(expense.total)}</p>
                </div>
              </div>
              <div className="min-w-[80px] text-right">
                <p className="mb-1 text-xs text-slate-500">Your share</p>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${expense.status === "lending" ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"}`}>
                  {expense.status === "lending" ? "+" : "-"}{formatCurrency(expense.yourShare)}
                </span>
              </div>
              <ChevronRight className="ml-2 h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
          )
        })}
        {filtered.length === 0 && <div className="p-10 text-center text-sm font-medium text-slate-500">No expenses found for this filter.</div>}
      </div>
    </div>

    {/* Expense Detail Modal */}
    {selectedExpense && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in" onClick={() => { setSelectedExpense(null); setIsEditing(false); }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in" onClick={e => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900">{isEditing ? 'Edit Expense' : 'Expense Details'}</h2>
            <div className="flex items-center gap-2">
              {!isEditing && selectedExpense.paidBy === "You" && (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              )}
              <button onClick={() => { setSelectedExpense(null); setIsEditing(false); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Amount ({currency})</label>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-medium" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 font-bold text-slate-700">
                  <option value="food">🍽️ Food</option>
                  <option value="home">🏠 Housing</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="entertainment">📺 Entertainment</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 rounded-xl bg-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-600 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving ? 'Saving...' : <><Save className="h-4 w-4" /> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Category + Description */}
              <div className="flex items-center gap-4">
                {(() => {
                  const catData = categoryIcons[selectedExpense.category] || categoryIcons.food;
                  const CatIcon = catData.icon;
                  return (
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${catData.bg}`}>
                      <CatIcon className={`h-7 w-7 ${catData.color}`} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-xl font-bold text-slate-900">{selectedExpense.description}</p>
                  <p className="text-sm text-slate-500 capitalize">{(categoryIcons[selectedExpense.category] || categoryIcons.food).label}</p>
                </div>
              </div>

              {/* Amount + Paid By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-slate-900">{formatCurrency(selectedExpense.total)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paid By</p>
                  <p className="text-lg font-bold text-slate-900">{selectedExpense.paidByName}</p>
                </div>
              </div>

              {/* Date + Split Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-700">{selectedExpense.fullDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Split Type</p>
                  <p className="text-sm font-bold text-slate-700">{selectedExpense.splitType}</p>
                </div>
              </div>

              {/* Splits Breakdown */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Split Breakdown</p>
                <div className="space-y-2">
                  {selectedExpense.splits.map((s, i) => {
                    const splitUser = users.find(u => u.id === s.userId);
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {splitUser?.name ? splitUser.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '??'}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{splitUser?.name || 'Unknown'}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(s.amountOwed)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  )
}