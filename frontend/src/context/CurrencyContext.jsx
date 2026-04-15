import React, { createContext, useState, useContext } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrencyState] = useState(() => {
        return localStorage.getItem('paypals_currency') || 'USD';
    });
    const MULTIPLIER = 95;

    const setCurrency = (val) => {
        localStorage.setItem('paypals_currency', val);
        setCurrencyState(val);
    };

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        if (currency === 'INR') {
            return `₹${(num * MULTIPLIER).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `$${num.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, multiplier: currency === 'INR' ? MULTIPLIER : 1 }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
