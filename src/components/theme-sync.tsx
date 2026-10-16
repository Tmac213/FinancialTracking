import { useEffect } from "react";

const query = "(prefers-color-scheme: dark)";

/**
 * Keeps the `.dark` class in sync with the operating system colour scheme, so
 * the whole token set in index.css switches with it. Rendered once from App.
 */
export const ThemeSync = () => {
  useEffect(() => {
    const media = window.matchMedia(query);
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };

    apply(media.matches);

    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
};
