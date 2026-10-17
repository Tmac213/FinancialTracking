import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ROUTE_TITLE_MAP: Record<string, string> = {
  "/": "pages.home",
  "/auth": "pages.auth",
  "/dashboard": "pages.dashboard",
  "/transactions": "pages.transactions",
  "/money-tracker": "pages.moneyTracker",
  "/categories": "pages.categories",
  "/settings": "pages.settings",
  "/settings/conversion-rate": "pages.conversionRate",
};

export const DocumentTitleSync = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const key = ROUTE_TITLE_MAP[pathname] ?? "pages.notFound";
    const pageName = t(key);
    const appName = t("common.appName");

    if (pageName && pageName !== key) {
      document.title = `${pageName} | ${appName}`;
    } else {
      document.title = appName;
    }
  }, [pathname, t]);

  return null;
};
