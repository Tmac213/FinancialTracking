import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getRates } from '@/lib/fx';
import { DEFAULT_CURRENCY } from '@/lib/currencies';

type ExchangeRates = Record<string, number>;

interface ExchangeRateContextProps {
  rates: ExchangeRates;
  baseCurrency: string;
  setBaseCurrency: (currency: string) => void;
  convert: (amount: number, from: string, to?: string) => number;
  refreshRates: () => void;
  pollingInterval: number;
  setPollingInterval: (seconds: number) => void;
}

const ExchangeRateContext = createContext<ExchangeRateContextProps | undefined>(undefined);

export const ExchangeRateProvider = ({ children }: { children: ReactNode }) => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [baseCurrency, setBaseCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [pollingInterval, setPollingInterval] = useState<number>(300);

  const fetchRates = async () => {
    try {
      // Use the same backend source as ConversionRatePage for consistency.
      const data = await getRates('USD');
      if (data && typeof data.rates === 'object') {
        setRates(data.rates);
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates', err);
    }
  };
  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (pollingInterval <= 0) return undefined;
    const id = setInterval(fetchRates, pollingInterval * 1000);
    return () => clearInterval(id);
  }, [pollingInterval]);

  const convert = (amount: number, from: string, to?: string) => {
    const target = to ?? baseCurrency;
    const fromU = from.toUpperCase();
    const toU = target.toUpperCase();
    if (fromU === toU) return amount;
    const fromRate = fromU === DEFAULT_CURRENCY ? 1 : rates[fromU];
    const toRate = toU === DEFAULT_CURRENCY ? 1 : rates[toU];
    if (!fromRate || !toRate) return amount;
    const usd = amount / fromRate;
    return usd * toRate;
  };

  const value: ExchangeRateContextProps = {
    rates,
    baseCurrency,
    setBaseCurrency,
    convert,
    refreshRates: fetchRates,
    pollingInterval,
    setPollingInterval,
  };

  return <ExchangeRateContext.Provider value={value}>{children}</ExchangeRateContext.Provider>;
};

export const useExchangeRate = (): ExchangeRateContextProps => {
  const ctx = useContext(ExchangeRateContext);
  if (!ctx) throw new Error('useExchangeRate must be used within ExchangeRateProvider');
  return ctx;
};
