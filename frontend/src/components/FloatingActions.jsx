import React, { useState } from "react"
import { Plus, Receipt, Users, Wallet } from "lucide-react"

export function FloatingActions({ onAddExpense, onSettle }) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: Receipt, label: "Add Expense", color: "bg-teal-500 hover:bg-teal-600", onClick: onAddExpense },
    { icon: Wallet, label: "Settle Up", color: "bg-slate-900 hover:bg-slate-800", onClick: onSettle },
    { icon: Users, label: "Split Bill", color: "bg-blue-500 hover:bg-blue-600", onClick: () => console.log('Split Bill') },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 lg:hidden">
      
      <div className={`flex flex-col-reverse items-end gap-3 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {actions.map((action, index) => (
          <div 
            key={action.label} 
            className={`flex items-center gap-3 transition-all duration-200 ease-out ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2.5 scale-90 opacity-0"}`} 
            style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
          >
            <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg">{action.label}</span>
            <button 
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? "rotate-45 bg-slate-900 text-white" : "bg-teal-500 text-white shadow-teal-500/30"}`}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}