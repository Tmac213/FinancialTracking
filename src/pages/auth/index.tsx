import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, Globe2, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/auth-context";
import { AuthForm } from "./AuthForm";

const FEATURES = [
  { icon: BarChart3, key: "auth.features.track" },
  { icon: Globe2, key: "auth.features.currencies" },
  { icon: ShieldCheck, key: "auth.features.private" },
];

const AuthPage = () => {
  const { t } = useTranslation();
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="loading" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-gradient-primary px-6 py-10 text-primary-foreground lg:w-[46%] lg:px-12 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,hsl(var(--primary-foreground))_0,transparent_45%),radial-gradient(circle_at_80%_70%,hsl(var(--primary-foreground))_0,transparent_40%)]"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-semibold">{t("common.appName")}</span>
            <span className="text-xs opacity-80">{t("common.tagline")}</span>
          </div>
        </div>

        <div className="relative flex flex-col gap-6">
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
            {t("auth.hero.title")}
          </h1>
          <p className="max-w-md text-sm opacity-85">{t("auth.hero.subtitle")}</p>

          <ul className="flex flex-col gap-3 pt-2">
            {FEATURES.map((feature) => (
              <li key={feature.key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <feature.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed opacity-90">
                  {t(feature.key)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs opacity-75">{t("auth.hero.footnote")}</p>
      </section>

      <section className="ledger-grid-bg flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-14">
        <div className="w-full max-w-md animate-scale-in">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold tracking-tight">
                {t("auth.card.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("auth.card.subtitle")}
              </p>
            </div>
            <LanguageSwitcher className="h-9 w-[132px] min-w-0" />
          </div>

          <Card variant="elevated">
            <CardContent className="p-6">
              <AuthForm />
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("auth.card.terms")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
