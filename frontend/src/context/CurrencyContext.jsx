import React, { createContext, useState, useContext } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    // defaults to 'USD'
    const [currency, setCurrency] = useState('USD');
    const MULTIPLIER = 95;

    // A helper method that takes any raw internal USD amount 
    // and returns the beautifully formatted localized string!
    const formatCurrency = (amount) => {
        if (currency === 'INR') {
            return `₹${(amount * MULTIPLIER).toFixed(2)}`;
        }
        // Default USD
        return `$${amount.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, multiplier: currency === 'INR' ? MULTIPLIER : 1 }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
