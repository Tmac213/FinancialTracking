\# Code Guideline



\## Project Structure Overview



```

project-root/

&#x20; ├── i18n.config.json       # i18n manifest for supported locales and language metadata

&#x20; ├── public/

&#x20; │   └── locales/           # public/locales/{code}.json translation files

&#x20; ├── supabase/

&#x20; │   ├── config.toml        # Enter Cloud project + backend function settings

&#x20; │   └── functions/         # Backend functions, one directory per function

&#x20; ├── src/

&#x20; │   ├── components/        # All reusable UI components

&#x20; │   │   ├── layout/        # App shell: AppLayout (sidebar + header), ProtectedRoute

&#x20; │   │   └── ui/            # Prebuilt and custom UI components, grouped by function

&#x20; │   ├── hooks/             # Custom React hooks

&#x20; │   ├── i18n/              # i18n runtime: config.ts (entry) + util.ts (helpers)

&#x20; │   ├── integrations/      # Framework-generated backend client and types (never edit)

&#x20; │   ├── lib/               # Utility functions and libraries

&#x20; │   ├── pages/             # Application pages (each page in its own subdirectory)

&#x20; │   ├── App.tsx            # Main app component, sets up route providers

&#x20; │   ├── router.tsx         # Router config, sets up routing

&#x20; │   ├── main.tsx           # Entry point for the React app

&#x20; │   └── index.css          # Global styles

&#x20; ├── package.json           # Project metadata and scripts

&#x20; ├── tailwind.config.ts     # Tailwind CSS configuration

&#x20; └── ...                    # Other config and lock files

```



> Backend-handoff temporary files (`scripts/`, `i18n.scan.json`, `reports/i18n/`, `docs/i18n-\*.md`) are kept in the repo only until backend integration of i18n statistics/scan/auto-translate is complete. They are owned by the backend long-term and will be removed once integration lands. Treat them as read-only handoff copies — do not extend them.



\## Directory Responsibilities



\- \*\*supabase/functions/\*\*: Backend functions, one directory per function (`<name>/index.ts`). They run server-side on Enter Cloud, read secrets with `Deno.env.get()`, and are deployed with the deploy tool rather than bundled into the frontend.

\- \*\*supabase/config.toml\*\*: Backend function registration and per-function settings such as `verify\_jwt`.

\- \*\*src/integrations/\*\*: Framework-generated backend client and database types. Read them, never edit them — they are rewritten.

\- \*\*public/\*\*: Static files served directly. Place images, icons, and robots.txt here.

\- \*\*public/locales/\*\*: Translation files, one per language (`{code}.json`). Flat dotted keys (e.g. `home.hero.title`); the `fallbackLng` file is the structural source of truth.

\- \*\*i18n.config.json\*\*: The lightweight i18n manifest for fallback language, language labels, browser detection aliases, and document direction. Single source of truth for the language list.

\- \*\*src/components/\*\*: All UI components.  

&#x20; - \*\*ui/\*\*: Contains atomic and composite UI components.  

&#x20; - \*\*layout/\*\*: The app shell — `app-layout.tsx` (sidebar, header, sign-out) and `protected-route.tsx` (auth gate). Route-level pages render as its `Outlet`.

&#x20; - \*Group related components into subdirectories if they share a domain or feature (e.g., `form/`, `charts/`).\*

\- \*\*src/hooks/\*\*: Custom React hooks. Each file should export a single hook focused on one responsibility.

&#x20; - `auth-context.ts` holds the auth `Context` and the `useAuth` hook; `auth-provider.tsx` holds the `AuthProvider` component that feeds it. They are split so each file keeps a single export shape (provider components vs. hooks).

&#x20; - Data hooks wrap the backend tables in React Query: `use-profile.ts`, `use-categories.ts`, `use-transactions.ts`. `use-rates.ts` reads exchange rates, and `use-change-base-currency.ts` owns the re-conversion performed when the account base currency changes.

\- \*\*src/i18n/\*\*: Two files only.

&#x20; - `config.ts` is the runtime entry: imports the manifest via `util.ts`, initializes i18next (HTTP backend, language detector, react binding), syncs `<html lang/dir>`, and re-exports the helpers. Importing this file for its side effect boots i18next.

&#x20; - `util.ts` holds pure helpers parsed from the manifest: `fallbackLng`, `supportedLngs`, `languageOptions`, `normalizeLanguage`, `getLanguageDirection`, plus types.

&#x20; - Components use the official `useTranslation()` from `react-i18next` directly; there is no project-specific `useT` wrapper.

\- \*\*src/lib/\*\*: Utility functions and libraries that are not React components or hooks.

&#x20; - `currencies.ts` — full ISO 4217 code list plus `Intl`-based formatting, naming, and searching.

&#x20; - `finance.ts` — dates, periods, and the pure aggregation helpers (totals, monthly series, category split, deltas) shared by the dashboard and the ledger.

&#x20; - `fx.ts` — exchange-rate access through the `fx-rates` backend function, plus `findRate`/`convertAmount`.

&#x20; - `category-palette.ts` — the colour choices offered for categories.

\- \*\*src/pages/\*\*: All route-level pages.  

&#x20; - \*Each page should have its own subdirectory if it contains more than a single file or has related logic/components.\*

&#x20; - `auth/`, `dashboard/`, `transactions/`, `categories/`, `settings/`. Page-local parts live beside their `index.tsx` (for example `transactions/useTransactionFilters.ts`, `dashboard/CashFlowChart.tsx`).

\- \*\*src/App.tsx\*\*: Sets up global providers.

\- \*\*src/router.tsx\*\*: Sets up routing.

\- \*\*src/main.tsx\*\*: Application entry point.



\*\*Important:\*\*

Whenever a new module (such as a component, hook, or utility) or a new page is added or removed, this document \*\*must be updated immediately\*\* to reflect the changes. Keeping this documentation up to date ensures that all collaborators have a clear understanding of the current project structure and its intended organization.



\## How to Add New Code



\### 1. Adding a New Page



\- \*\*Create a subdirectory under `src/pages/` for each new page.\*\*

&#x20; - Example: For a "Dashboard" page, create `src/pages/dashboard/`.

\- \*\*Place the main page component as `index.tsx` inside the subdirectory.\*\*

\- \*\*Add any page-specific components or logic in the same subdirectory.\*\*

\- \*\*Register the new route in `src/router.tsx and generate a semantic name.\*\*

&#x20; - Example:

&#x20;   ```tsx

&#x20;   import Dashboard from "./pages/dashboard";

&#x20;   // ...

&#x20;   {

&#x20;     path: "/dashboard",

&#x20;     name: 'dashboard',

&#x20;     element: <Dashboard />

&#x20;   }

&#x20;   ```



\### 2. Adding a New Component



\- \*\*If you are adding a group of related components, create a subdirectory (e.g., `form/`, `charts/`).\*\*

\- \*\*If the component is only used by a specific page, place it in that page's subdirectory under `src/pages/`.\*\*

\- \*\*Each component should be focused on a single responsibility.\*\*

\- \*\*Small files (< 100 lines) are encouraged for a single component.\*\*



\### 3. Adding a New Hook



\- \*\*Create a new file in `src/hooks/` named after the hook (e.g., `use-feature.ts`).\*\*

\- \*\*Each file should export only one hook.\*\*

\- \*\*Hooks should be as small and focused as possible.\*\*



\### 4. Adding Utilities



\- \*\*Add utility functions to `src/lib/`.\*\*

\- \*\*Group related utilities in the same file or subdirectory if needed.\*\*



\### 5. Adding or Updating Languages



\- \*\*Language metadata must go through `i18n.config.json`.\*\*

\- \*\*Do not hardcode supported languages, labels, browser detection aliases, or RTL direction lists in `src/i18n/\*.ts`.\*\*

\- \*\*Locale content lives in `public/locales/{code}.json`\*\* as flat dotted-key JSON; the `fallbackLng` file owns the canonical key set.

\- \*\*Runtime code reads the manifest only through `src/i18n/util.ts`.\*\* Adding or removing a language means editing `i18n.config.json` plus the matching `public/locales/{code}.json`; nothing in `src/i18n/` needs to change.

\- \*\*Translations are read with the official `useTranslation()` from `react-i18next`.\*\* No custom hook, no cast at call sites.



\## Coding Best Practices



\- \*\*One module, one responsibility:\*\*  

&#x20; Each file (component, hook, utility) should do one thing only.

\- \*\*High cohesion, low coupling:\*\*  

&#x20; Keep related logic together and avoid unnecessary dependencies between modules.

\- \*\*Naming conventions:\*\*  

&#x20; - Use `PascalCase` for components and page directories.

&#x20; - Use `camelCase` for hooks and utility functions.

&#x20; - Name page subdirectories and files after their route or feature.

\- \*\*Component structure:\*\*  

&#x20; - Keep components small and focused.

&#x20; - Extract subcomponents if a component grows too large.

\- \*\*Page structure:\*\*  

&#x20; - Place all logic, hooks, and components specific to a page in its subdirectory.

&#x20; - Only share code via `components/`, `hooks/`, or `lib/` if it is truly reusable.

\- \*\*Documentation:\*\*  

&#x20; - Add comments for complex logic.

&#x20; - Document the purpose of each module at the top of the file if not obvious.



\## Example: Adding a New "Profile" Page



1\. \*\*Create a directory:\*\*  

&#x20;  `src/pages/profile/`

2\. \*\*Add the main page component:\*\*  

&#x20;  `src/pages/profile/index.tsx`

3\. \*\*Add page-specific components:\*\*  

&#x20;  `src/pages/profile/ProfileHeader.tsx`, `src/pages/profile/ProfileDetails.tsx`

4\. \*\*Register the route in `App.tsx`:\*\*

&#x20;  ```tsx

&#x20;  import Profile from "./pages/profile";

&#x20;  // ...

&#x20;  <Route path="/profile" element={<Profile />} />

&#x20;  ```

5\. \*\*If you need a reusable button, add it to `src/components/ui/button.tsx`.\*\*



