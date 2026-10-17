import type { Config } from 'tailwindcss';

const tailwindConfig = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,tsx,jsx,html}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        success: 'hsl(var(--success))',
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))',
        info: 'hsl(var(--info))',
        'info-foreground': 'hsl(var(--info-foreground))',
        income: 'hsl(var(--income))',
        'income-foreground': 'hsl(var(--income-foreground))',
        expense: 'hsl(var(--expense))',
        'expense-foreground': 'hsl(var(--expense-foreground))',
        ring: 'hsl(var(--ring))',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-income': 'var(--gradient-income)',
        'gradient-expense': 'var(--gradient-expense)',
      },
      boxShadow: {
        elegant: 'var(--shadow-elegant)',
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)',
      },
    },
  },
  plugins: [],
} as const satisfies Config;

export default tailwindConfig;


