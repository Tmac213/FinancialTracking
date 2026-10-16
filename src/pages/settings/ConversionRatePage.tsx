import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { getRates, updateFXRate } from '@/lib/fx';

// Page showing all currency rates relative to USD with edit capability.

import { supabase } from '@/integrations/supabase/client';

// Page showing all currency rates relative to USD with edit capability.
// It automatically refreshes every 5 minutes and listens for real‑time updates via Supabase.
const ConversionRatePage = () => {
  const { t } = useTranslation();
const { refreshRates } = useExchangeRate();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showReverse, setShowReverse] = useState(false);

  // Load rates from the backend.
  const loadRates = async () => {
    setLoading(true);
    try {
      const data = await getRates('USD');
      setSnapshot(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch rates', e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + automatic polling every 5 minutes.
  useEffect(() => {
    void loadRates();
    const interval = setInterval(() => {
      void loadRates();
    }, 1 * 60 * 1000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  // Subscribe to Supabase realtime channel for any rate updates.
  useEffect(() => {
    const channel = supabase
      .channel('fx-updates')
      .on('broadcast', { event: 'rate_updated' }, (payload) => {
        // The payload can contain a list of updated codes; we simply reload.
        void loadRates();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleChange = (code: string, value: string) => {
    setEditing((prev) => ({ ...prev, [code]: value }));
  };

  const handleUpdate = async (code: string) => {
    const newRateStr = editing[code];
    const newRate = parseFloat(newRateStr);
    if (isNaN(newRate) || newRate <= 0) {
      alert('Please enter a valid positive number');
      return;
    }
    setUpdating((prev) => ({ ...prev, [code]: true }));
    try {
      await updateFXRate('USD', code, newRate);
      await loadRates();
      // Ensure the main app context also refreshes its rates.
      if (refreshRates) refreshRates();
    } catch (e) {
      console.error('Failed to update rate', e);
    } finally {
      setUpdating((prev) => ({ ...prev, [code]: false }));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('settings.currency.conversionRate')}</h2>
        <Button variant="outline" onClick={() => setShowReverse((prev) => !prev)}>
                    {showReverse ? 'Show Forward' : 'Show Reverse'}
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">{t('settings.currency.conversionRate')}</h3>
          <p className="text-sm text-muted-foreground">{t('settings.currency.conversionRateDescription')}</p>
        </div>
        <div className="p-6 pt-0">
          {loading || !snapshot ? (
            <Loader2 className="size-6 animate-spin mx-auto" aria-hidden="true" />
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Currency</th>
                    <th className="text-left py-2">Rate (1 USD = ?)</th>
{showReverse ? (
  <th className="text-left py-2">Reverse (1 ? = 1 USD)</th>
) : null}
                    <th className="text-left py-2">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(snapshot.rates).map(([code, rate]) => (
                    <tr key={code} className="border-b">
                      <td className="py-2">{code}</td>
                      <td className="py-2">{String(rate)}</td>
{showReverse && (<td className="py-2">{(1 / Number(rate)).toFixed(6)}</td>)}
                      <td className="flex items-center gap-2 py-2">
                        <Input
                          value={editing[code] ?? ''}
                          placeholder="New rate"
                          onChange={(e) => handleChange(code, e.target.value)}
                          className="w-24"
                        />
                        <Button
                          variant="outline"
                          onClick={() => void handleUpdate(code)}
                          disabled={updating[code]}
                        >
                          {updating[code] ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            'Update'
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lastUpdated && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {t('settings.currency.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
export default ConversionRatePage;

