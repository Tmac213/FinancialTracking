import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, Variants } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Globe2,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart3,
  Smartphone,
  Lock,
  Calendar,
  Bell,
  Cpu,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/auth-context";
import { getLanguageDirection } from "@/i18n/util";

// Animation presets
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const pageDir = getLanguageDirection(i18n.language ?? i18n.resolvedLanguage);

  React.useEffect(() => {
    document.documentElement.dir = pageDir;
  }, [pageDir]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      dir={pageDir}
      className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 overflow-x-hidden"
    >
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <Wallet className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                {t("common.appName")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {t("landing.header.tagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("landing.header.features")}
            </a>
            <a
              href="#analytics"
              onClick={(e) => scrollToSection(e, "analytics")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("landing.header.analytics")}
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, "security")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("landing.header.security")}
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, "faq")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              {t("landing.header.faq")}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher className="hidden sm:flex h-9 w-[138px] text-xs" />
            {user ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                <Link to="/dashboard">
                  {t("landing.header.dashboard")}
                  <ArrowRight className="ms-1.5 size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                  <Link to="/auth?mode=signin">{t("auth.tabs.signin")}</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant font-medium">
                  <Link to="/auth?mode=signup">
                    {t("auth.tabs.signup")}
                    <ArrowRight className="ms-1.5 size-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-primary/15 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[420px] h-[260px] bg-info/10 blur-[110px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-md inline-flex items-center"
            >
              <Sparkles className="size-3.5 me-2 inline" /> {t("landing.hero.badge")}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            {t("landing.hero.prefix")}{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-500 bg-clip-text text-transparent">
              {t("landing.hero.highlight")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10"
          >
            {t("landing.hero.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-elegant bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Link to="/auth">
                {t("landing.cta.getStarted")}
                <ArrowRight className="ms-2 size-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-medium border-border/80 hover:bg-secondary/60 w-full sm:w-auto"
            >
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
              >
                {t("landing.cta.exploreFeatures")}
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-medium text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> {t("landing.features.freeTier")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> {t("landing.features.currencyExchange")}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> {t("landing.features.languagesRtl")}
            </span>
          </motion.div>

          {/* Interactive Mockup Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 sm:mt-20 relative mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card/60 p-3 sm:p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-xl border border-border/50 bg-background/90 p-4 sm:p-6 text-left">
              <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-4 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-destructive/70" />
                  <div className="size-3 rounded-full bg-warning/70" />
                  <div className="size-3 rounded-full bg-success/70" />
                  <span className="text-xs font-medium text-muted-foreground ms-2">
                    app.financialtracking.io/dashboard
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs font-mono font-normal">
                  {t("landing.mock.rates")}
                </Badge>
              </div>

              {/* Mini Mock Dashboard Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-border/60 bg-card p-4 transition-transform hover:-translate-y-1">
                  <span className="text-xs font-medium text-muted-foreground">{t("landing.mock.income")}</span>
                  <div className="text-2xl font-bold text-success mt-1 numeric">$12,450.00</div>
                  <span className="text-[11px] text-muted-foreground">{t("landing.mock.incomeTrend")}</span>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-4 transition-transform hover:-translate-y-1">
                  <span className="text-xs font-medium text-muted-foreground">{t("landing.mock.expenses")}</span>
                  <div className="text-2xl font-bold text-destructive mt-1 numeric">$4,120.50</div>
                  <span className="text-[11px] text-muted-foreground">{t("landing.mock.expensesTrend")}</span>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-4 transition-transform hover:-translate-y-1">
                  <span className="text-xs font-medium text-muted-foreground">{t("landing.mock.savings")}</span>
                  <div className="text-2xl font-bold text-primary mt-1 numeric">66.9%</div>
                  <span className="text-[11px] text-muted-foreground">{t("landing.mock.savingsTarget")}</span>
                </div>
              </div>

              {/* Transactions preview item */}
              <div className="rounded-lg border border-border/40 bg-secondary/30 p-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t("landing.mock.txTitle")}</div>
                    <div className="text-xs text-muted-foreground">{t("landing.mock.txSubtitle")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success numeric">+$3,500.00</div>
                  <div className="text-[11px] text-muted-foreground">{t("landing.mock.txEquivalent")}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid (Inspired by Investas) */}
      <section id="features" className="py-24 md:py-32 border-t border-border/60 bg-secondary/20 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("landing.features.sectionBadge")}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
              {t("landing.features.sectionTitle")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("landing.features.sectionDesc")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f1Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f1Desc")}
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Globe2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f2Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f2Desc")}
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <PieChart className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f3Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f3Desc")}
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f4Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f4Desc")}
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f5Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f5Desc")}
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              variants={fadeInUp}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t("landing.features.f6Title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("landing.features.f6Desc")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Analytics Section (Investas feature: You in the center of investments) */}
      <section id="analytics" className="py-24 md:py-32 border-t border-border/60 relative">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("landing.analytics.badge")}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-6">
                {t("landing.analytics.title")}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                {t("landing.analytics.desc")}
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t("landing.analytics.item1Title")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("landing.analytics.item1Desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t("landing.analytics.item2Title")}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("landing.analytics.item2Desc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-6">
                <span className="text-sm font-semibold text-foreground">{t("landing.analytics.distTitle")}</span>
                <span className="text-xs text-muted-foreground">{t("landing.analytics.distPeriod")}</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{t("landing.analytics.catBusiness")}</span>
                    <span className="text-primary font-bold">52%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "52%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{t("landing.analytics.catHousing")}</span>
                    <span className="text-info font-bold">28%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-info rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{t("landing.analytics.catLifestyle")}</span>
                    <span className="text-warning font-bold">20%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Target Audiences: Individuals & Companies (from Investas) */}
      <section className="py-24 md:py-32 border-t border-border/60 bg-secondary/15">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("landing.audiences.badge")}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
              {t("landing.audiences.title")}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col justify-between hover:border-border transition-all"
            >
              <div>
                <Badge variant="secondary" className="mb-4">{t("landing.audiences.freelancerBadge")}</Badge>
                <h3 className="text-xl font-bold mb-3">{t("landing.audiences.freelancerTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("landing.audiences.freelancerDesc")}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground border-t border-border/50 pt-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.freelancerF1")}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.freelancerF2")}</li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="rounded-2xl border-2 border-primary/50 bg-card p-8 flex flex-col justify-between relative shadow-elegant hover:scale-[1.02] transition-transform"
            >
              <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                {t("landing.audiences.popularBadge")}
              </div>
              <div>
                <Badge variant="outline" className="mb-4 border-primary text-primary">{t("landing.audiences.individualBadge")}</Badge>
                <h3 className="text-xl font-bold mb-3">{t("landing.audiences.individualTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("landing.audiences.individualDesc")}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground border-t border-border/50 pt-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.individualF1")}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.individualF2")}</li>
              </ul>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col justify-between hover:border-border transition-all"
            >
              <div>
                <Badge variant="secondary" className="mb-4">{t("landing.audiences.businessBadge")}</Badge>
                <h3 className="text-xl font-bold mb-3">{t("landing.audiences.businessTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("landing.audiences.businessDesc")}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-muted-foreground border-t border-border/50 pt-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.businessF1")}</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> {t("landing.audiences.businessF2")}</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 md:py-32 border-t border-border/60 relative">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("landing.security.badge")}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2 mb-4">
              {t("landing.security.title")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("landing.security.desc")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeInUp} className="rounded-2xl border border-border/60 bg-card p-6 text-center">
              <div className="size-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                <Lock className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.security.f1Title")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("landing.security.f1Desc")}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="rounded-2xl border border-border/60 bg-card p-6 text-center">
              <div className="size-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.security.f2Title")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("landing.security.f2Desc")}
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="rounded-2xl border border-border/60 bg-card p-6 text-center">
              <div className="size-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.security.f3Title")}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("landing.security.f3Desc")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 border-t border-border/60 bg-secondary/15">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("landing.faq.badge")}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2">
              {t("landing.faq.title")}
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            <motion.div variants={fadeInUp} className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.faq.question1")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.faq.answer1")}
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.faq.question2")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.faq.answer2")}
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="text-base font-bold text-foreground mb-2">{t("landing.faq.question3")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("landing.faq.answer3")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeInUp}
            className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card p-10 sm:p-16 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[450px] h-[200px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
              {t("landing.bottom.cta.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm sm:text-base">
              {t("landing.bottom.cta.description")}
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold shadow-elegant bg-primary hover:bg-primary/90">
              <Link to="/auth">
                {t("landing.bottom.cta.button")}
                <ArrowRight className="ms-2 size-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-sm">
              <Wallet className="size-4" />
            </span>
            <span className="text-sm font-bold text-foreground">{t("common.appName")}</span>
          </div>

          <p className="text-xs text-muted-foreground text-center sm:text-start">
            © {new Date().getFullYear()} {t("common.appName")}. {t("landing.footer.rights")}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">
              {t("auth.tabs.signin")}
            </Link>
            <span>•</span>
            <Link to="/auth" className="hover:text-foreground transition-colors">
              {t("auth.tabs.signup")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
