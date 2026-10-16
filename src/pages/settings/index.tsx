import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, Loader2, LogOut, Save, TriangleAlert, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CurrencySelect } from "@/components/currency-select";
import { useAuth } from "@/hooks/auth-context";
import { useChangeBaseCurrency } from "@/hooks/use-change-base-currency";
import { useUpdateProfile, useProfile } from "@/hooks/use-profile";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { profile, baseCurrency, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changeBaseCurrency = useChangeBaseCurrency();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [draftCurrency, setDraftCurrency] = useState(baseCurrency);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  useEffect(() => {
    setDraftCurrency(baseCurrency);
  }, [baseCurrency]);

  const saveDisplayName = async () => {
    try {
      await updateProfile.mutateAsync({ display_name: displayName.trim() });
      toast.success(t("settings.profile.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    }
  };

  const saveBaseCurrency = async () => {
    try {
      const result = await changeBaseCurrency.mutateAsync(draftCurrency);
      toast.success(
        t("settings.currency.saved", {
          currency: draftCurrency,
          count: result.updated,
        }),
      );
      if (result.skipped.length > 0) {
        toast.warning(
          t("settings.currency.skipped", { currencies: result.skipped.join(", ") }),
        );
      }
      if (result.ratesStale) {
        toast.warning(t("settings.currency.stale"));
      }
    } catch (error) {
      toast.error(t("settings.currency.failed"));
      setDraftCurrency(baseCurrency);
      if (error instanceof Error) console.warn(error.message);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card variant="elevated">
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="size-4 text-primary" aria-hidden="true" />
            {t("settings.profile.title")}
          </CardTitle>
          <CardDescription>{t("settings.profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-display-name">
              {t("settings.profile.displayName")}
            </Label>
            <Input
              id="settings-display-name"
              value={displayName}
              maxLength={60}
              disabled={isLoading}
              placeholder={t("settings.profile.displayNamePlaceholder")}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("settings.profile.email")}</Label>
            <Input value={user?.email ?? ""} readOnly disabled />
          </div>

          <div className="flex justify-end">
            <Button
              variant="hero"
              onClick={() => void saveDisplayName()}
              disabled={
                updateProfile.isPending ||
                displayName.trim() === (profile?.display_name ?? "").trim()
              }
            >
              {updateProfile.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="gap-1">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold">
            {t("settings.currency.title")}
            <Badge variant="glow" className="numeric">
              {baseCurrency}
            </Badge>
          </CardTitle>
          <CardDescription>{t("settings.currency.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-base-currency">
              {t("settings.currency.label")}
            </Label>
            <CurrencySelect
              id="settings-base-currency"
              value={draftCurrency}
              onChange={setDraftCurrency}
            />
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {t("settings.currency.warning")}
          </p>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {t("settings.currency.ratesNote")}
          </p>

          <Separator />

          <div className="flex justify-end">
            <Button
              variant="hero"
              onClick={() => void saveBaseCurrency()}
              disabled={changeBaseCurrency.isPending || draftCurrency === baseCurrency}
            >
              {changeBaseCurrency.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {t("settings.currency.apply")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/settings/conversion-rate")}
            >
              Conversion Rate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader className="gap-1">
          <CardTitle className="text-base font-semibold">
            {t("settings.account.title")}
          </CardTitle>
          <CardDescription>{t("settings.account.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" aria-hidden="true" />
            {t("auth.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
