import type { Config } from 'tailwindcss'

const config = {
    content: ['./src/**/*.{ts,tsx}', '../../../apps/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
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
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                sidebar: 'hsl(var(--sidebar))',
                'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
                'sidebar-primary': 'hsl(var(--sidebar-primary))',
                'sidebar-primary-foreground':
                    'hsl(var(--sidebar-primary-foreground))',
                'sidebar-accent': 'hsl(var(--sidebar-accent))',
                'sidebar-accent-foreground':
                    'hsl(var(--sidebar-accent-foreground))',
                'sidebar-border': 'hsl(var(--sidebar-border))',
                'sidebar-ring': 'hsl(var(--sidebar-ring))',
                'chart-1': 'hsl(var(--chart-1))',
                'chart-2': 'hsl(var(--chart-2))',
                'chart-3': 'hsl(var(--chart-3))',
                'chart-4': 'hsl(var(--chart-4))',
                'chart-5': 'hsl(var(--chart-5))',
                'cta-blue': 'var(--cta-blue)',
                'cta-blue-foreground': 'var(--cta-blue-foreground)',
                'cta-blue-hover': 'var(--cta-blue-hover)',
                'cta-blue-bg': 'var(--cta-blue-bg)',
                'cta-blue-border': 'var(--cta-blue-border)',
                'cta-green': 'var(--cta-green)',
                'cta-green-foreground': 'var(--cta-green-foreground)',
                'cta-green-hover': 'var(--cta-green-hover)',
                'cta-green-bg': 'var(--cta-green-bg)',
                'cta-green-border': 'var(--cta-green-border)',
                'cta-orange': 'var(--cta-orange)',
                'cta-orange-foreground': 'var(--cta-orange-foreground)',
                'cta-orange-hover': 'var(--cta-orange-hover)',
                'cta-orange-bg': 'var(--cta-orange-bg)',
                'cta-orange-border': 'var(--cta-orange-border)',
                // Prototype color palette - using CSS custom properties
                stone: {
                    50: 'var(--stone-50)',
                    100: 'var(--stone-100)',
                    200: 'var(--stone-200)',
                    300: 'var(--stone-300)',
                    400: 'var(--stone-400)',
                    500: 'var(--stone-500)',
                    600: 'var(--stone-600)',
                    700: 'var(--stone-700)',
                    800: 'var(--stone-800)',
                    900: 'var(--stone-900)',
                    950: 'var(--stone-950)',
                },
                gold: {
                    100: 'var(--gold-100)',
                    200: 'var(--gold-200)',
                    300: 'var(--gold-300)',
                    400: 'var(--gold-400)', // Classic Gold
                    500: 'var(--gold-500)', // Darker Gold
                    600: 'var(--gold-600)',
                },
                blush: {
                    50: '#FDF8F8',
                    100: '#FCE7E7',
                },
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
            },
            letterSpacing: {
                tighter: '-0.05em',
                tight: '-0.025em',
                widest: '0.25em',
            },
            backgroundImage: {
                'gold-gradient':
                    'linear-gradient(135deg, #E6CB7D 0%, #D4AF37 50%, #B4941F 100%)',
                'dark-gradient':
                    'linear-gradient(to bottom, rgba(28,25,23,0) 0%, rgba(28,25,23,0.8) 100%)',
            },
            borderRadius: {
                sm: 'calc(var(--radius) - 4px)',
                md: 'calc(var(--radius) - 2px)',
                lg: 'var(--radius)',
                xl: 'calc(var(--radius) + 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 1.5s infinite',
            },
        },
    },
    plugins: [],
} satisfies Config

export default config
