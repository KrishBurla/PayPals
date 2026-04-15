import { useCurrency } from '../context/CurrencyContext';
import React, { useState } from "react"
import { ArrowRight, Check, Bell, Send } from "lucide-react"
import { cn } from "../lib/utils"

export function MemberDebtList({ balances = {}, users = [], currentUser, onSettle, onRemind }) {
  const { formatCurrency } = useCurrency();
  const [remindingId, setRemindingId] = useState(null);
  
  const memberDebts = [];
  let totalNet = 0;
  
  Object.keys(balances).forEach(key => {
      const [whoOwes, whoIsOwed] = key.split(' -> ');
      const amount = balances[key];
      if (amount <= 0) return;
      
      let direction;
      let otherUserId;
      if (whoOwes === currentUser.id) {
          direction = "you_owe";
          otherUserId = whoIsOwed;
          totalNet -= amount;
      } else if (whoIsOwed === currentUser.id) {
          direction = "owes_you";
          otherUserId = whoOwes;
          totalNet += amount;
      } else {
          return;
      }
      
      const otherUser = users.find(u => u.id === otherUserId);
      const name = otherUser?.name || "Unknown";
      const initials = name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
      
      memberDebts.push({
          id: otherUserId,
          name,
          initials,
          color: direction === "you_owe" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600",
          amount,
          direction,
          lastActivity: "Recent"
      });
  });

  const handleRemind = async (debt) => {
      setRemindingId(debt.id);
      if (onRemind) await onRemind(debt.id, debt.name, debt.amount);
      setTimeout(() => setRemindingId(null), 2000);
  };
  
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Member Balances</h3>
      </div>
      
      <div className="space-y-4">
        {memberDebts.map((debt) => {
          const owesYou = debt.direction === "owes_you"
          const isReminding = remindingId === debt.id;
          return (
            <div key={debt.id} className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border border-white shadow-sm ${debt.color}`}>{debt.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{debt.name}</p>
                    <p className={cn("text-xs font-medium mt-0.5", owesYou ? "text-teal-600" : "text-rose-600")}>{owesYou ? "owes you" : "you owe"}</p>
                  </div>
                </div>
                <p className={cn("text-lg font-bold", owesYou ? "text-teal-600" : "text-rose-600")}>{formatCurrency(debt.amount)}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {owesYou && (
                  <button 
                    onClick={() => handleRemind(debt)} 
                    disabled={isReminding}
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold border transition-all",
                      isReminding 
                        ? "border-teal-200 bg-teal-50 text-teal-600" 
                        : "border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-slate-700"
                    )}
                  >
                    {isReminding ? (
                      <><Check className="mr-1.5 h-3 w-3" /> Sent!</>
                    ) : (
                      <><Bell className="mr-1.5 h-3 w-3" /> Remind</>
                    )}
                  </button>
                )}
                <button onClick={onSettle} className={cn("flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold transition-all active:scale-95", owesYou ? "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20" : "bg-slate-900 text-white hover:bg-slate-800")}><Check className="mr-1.5 h-3 w-3" /> {owesYou ? "Record" : "Pay"}</button>
              </div>
            </div>
          )
        })}
        {memberDebts.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400 font-medium">All settled up! 🎉</div>
        )}
      </div>
      <div className="mt-6 rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-teal-600/70 uppercase tracking-wide">Total Balance</p>
          <p className={`text-2xl font-black ${totalNet >= 0 ? 'text-teal-600' : 'text-rose-600'} tracking-tight`}>{`${totalNet >= 0 ? '+' : '-'}${formatCurrency(Math.abs(totalNet)).substring(1)}`}</p>
        </div>
        <button onClick={onSettle} className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95">Settle All</button>
      </div>
    </div>
  )
}