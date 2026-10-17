import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth-context";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

/** Supabase returns English server messages; map the common ones to clear copy. */
const errorKeyFor = (message: string): string => {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) return "auth.error.invalidCredentials";
  if (value.includes("already registered") || value.includes("already exists"))
    return "auth.error.alreadyRegistered";
  if (value.includes("password should be at least"))
    return "auth.error.shortPassword";
  if (value.includes("email") && value.includes("invalid")) return "auth.error.invalidEmail";
  if (value.includes("rate limit") || value.includes("too many"))
    return "auth.error.rateLimited";
  if (value.includes("failed to fetch") || value.includes("network"))
    return "auth.error.network";
  return "auth.error.generic";
};

type AuthFormProps = {
  initialMode?: Mode;
  onModeChange?: (mode: Mode) => void;
};

export const AuthForm = ({ initialMode = "signin", onModeChange }: AuthFormProps) => {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const destination =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const switchMode = (next: Mode) => {
    setMode(next);
    onModeChange?.(next);
    setFormError(null);
    setConfirmationSent(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError(t("auth.error.invalidEmail"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(t("auth.error.shortPassword"));
      return;
    }
    if (mode === "signup" && !displayName.trim()) {
      setFormError(t("auth.error.displayNameRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(trimmedEmail, password);
        navigate(destination, { replace: true });
      } else {
        const { needsEmailConfirmation } = await signUp(
          trimmedEmail,
          password,
          displayName,
        );
        if (needsEmailConfirmation) setConfirmationSent(true);
        else navigate(destination, { replace: true });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setFormError(t(errorKeyFor(message)));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-income/12 text-income">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold">{t("auth.confirm.title")}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("auth.confirm.description", { email })}
        </p>
        <Button variant="soft" onClick={() => switchMode("signin")}>
          {t("auth.confirm.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={mode} onValueChange={(value) => switchMode(value as Mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t("auth.tabs.signin")}</TabsTrigger>
          <TabsTrigger value="signup">{t("auth.tabs.signup")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {mode === "signup" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">{t("auth.fields.displayName")}</Label>
            <Input
              id="displayName"
              name="displayName"
              autoComplete="name"
              placeholder={t("auth.fields.displayNamePlaceholder")}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("auth.fields.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("auth.fields.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("auth.fields.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={t("auth.fields.passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? t("auth.fields.hidePassword") : t("auth.fields.showPassword")
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground">
              {t("auth.fields.passwordHint")}
            </p>
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
            )}
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="hero"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "signin" ? t("auth.submit.signin") : t("auth.submit.signup")}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {mode === "signin" ? t("auth.switch.toSignup") : t("auth.switch.toSignin")}{" "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? t("auth.tabs.signup") : t("auth.tabs.signin")}
        </button>
      </p>
    </div>
  );
};
