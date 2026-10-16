import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/auth-context";
import { useProfile } from "@/hooks/use-profile";

type NavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/transactions", labelKey: "nav.transactions", icon: Receipt },
  { to: "/categories", labelKey: "nav.categories", icon: Tags },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];

export const AppLayout = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { baseCurrency } = useProfile();

  const activeItem =
    NAV_ITEMS.find((item) => pathname.startsWith(item.to)) ?? NAV_ITEMS[0];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <Wallet className="size-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                {t("common.appName")}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {t("common.tagline")}
              </span>
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.group")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={t(item.labelKey)}
                      >
                        <Link to={item.to}>
                          <item.icon aria-hidden="true" />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("nav.baseCurrency")}
                </p>
                <p className="mt-1 numeric text-lg font-semibold text-sidebar-accent-foreground">
                  {baseCurrency}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-xs"
                  onClick={() => navigate("/settings")}
                >
                  {t("nav.changeCurrency")}
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase text-sidebar-accent-foreground">
              {(user?.email ?? "?").slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("auth.signOut")}
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <SidebarMenuButton
            className="hidden group-data-[collapsible=icon]:flex"
            tooltip={t("auth.signOut")}
            onClick={() => void signOut()}
          >
            <LogOut aria-hidden="true" />
            <span>{t("auth.signOut")}</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">
              {t(activeItem.labelKey)}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {t("nav.subtitle")}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="glow" className="hidden numeric sm:inline-flex">
              {baseCurrency}
            </Badge>
            <ThemeToggle />
            <LanguageSwitcher className="hidden h-9 w-[132px] min-w-0 md:flex" />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
