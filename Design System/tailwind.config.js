/**
 * Diplomacy 2.0 — Tailwind CSS Extension
 * D1 Design System Tokens → Tailwind Utility Classes
 *
 * Verwendung: Diese Datei als tailwind.config.js im Frontend-Projekt nutzen
 * oder die extend-Sektion in ein bestehendes Tailwind-Config mergen.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* ── FARBEN ──────────────────────────────────── */
      colors: {
        // Primary
        navy: {
          DEFAULT: '#1B2838',
          light:   '#253548',
          dark:    '#111C27',
        },
        // Secondary CTAs
        bordeaux: {
          DEFAULT: '#8B0000',
          light:   '#A50000',
          dark:    '#6B0000',
        },
        // Accent
        gold: {
          DEFAULT: '#C5A55A',
          light:   '#D4BA7A',
          dark:    '#9E7E3A',
          shine:   '#EDD898',
        },
        // Surfaces
        paper: {
          DEFAULT: '#F4E8C1',
          dark:    '#E8D5A0',
        },
        wood: {
          DEFAULT: '#5C3A21',
          light:   '#7A4E2D',
          dark:    '#3E2510',
        },
        // Semantic
        success: {
          DEFAULT: '#2D5016',
          light:   '#3D6B20',
        },
        warning:  '#D4A017',
        danger: {
          DEFAULT: '#CC0000',
          light:   '#E60000',
        },
        info:     '#2A6EA6',
        // Nations
        nation: {
          gb: '#E8A0B0',
          de: '#4A4A4A',
          at: '#C0392B',
          fr: '#3498DB',
          it: '#27AE60',
          ru: '#F1C40F',
          tr: '#1ABC9C',
        },
        // Map
        water: {
          DEFAULT: '#4A7FA5',
          deep:    '#2E5F80',
        },
        'land-neutral': '#C8B887',
      },

      /* ── TYPOGRAFIE ──────────────────────────────── */
      fontFamily: {
        heading: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body:    ['Inter', 'Source Sans Pro', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.5' }],
        'sm':   ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.5' }],
        'md':   ['17px', { lineHeight: '1.35' }],
        'lg':   ['20px', { lineHeight: '1.35' }],
        'xl':   ['24px', { lineHeight: '1.2' }],
        '2xl':  ['30px', { lineHeight: '1.2' }],
        '3xl':  ['38px', { lineHeight: '1.2' }],
        '4xl':  ['48px', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        tight:   '-0.02em',
        normal:  '0em',
        wide:    '0.05em',
        wider:   '0.1em',
        widest:  '0.2em',
      },

      /* ── ABSTÄNDE ────────────────────────────────── */
      spacing: {
        '0':  '0px',
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },

      /* ── BORDER RADIUS ───────────────────────────── */
      borderRadius: {
        'none': '0px',
        'sm':   '4px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        'full': '9999px',
      },

      /* ── BORDER WIDTH ────────────────────────────── */
      borderWidth: {
        thin:  '1px',
        base:  '2px',
        thick: '3px',
        heavy: '4px',
      },

      /* ── SCHATTEN ────────────────────────────────── */
      boxShadow: {
        'sm':          '0 1px 3px rgba(0, 0, 0, 0.4)',
        'base':        '0 2px 8px rgba(0, 0, 0, 0.5)',
        'md':          '0 4px 16px rgba(0, 0, 0, 0.6)',
        'lg':          '0 8px 32px rgba(0, 0, 0, 0.7)',
        'gold':        '0 0 12px rgba(197, 165, 90, 0.5), 0 0 4px rgba(197, 165, 90, 0.8)',
        'gold-strong': '0 0 24px rgba(197, 165, 90, 0.7), 0 0 8px rgba(197, 165, 90, 1.0)',
        'danger':      '0 0 12px rgba(204, 0, 0, 0.6), 0 0 4px rgba(204, 0, 0, 0.9)',
        'btn-raised':  '0 4px 0px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)',
        'btn-pressed': '0 1px 0px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.4)',
        'inset':       'inset 0 2px 6px rgba(0, 0, 0, 0.5)',
      },

      /* ── ANIMATIONEN ─────────────────────────────── */
      transitionDuration: {
        instant:  '80ms',
        fast:     '150ms',
        base:     '250ms',
        slow:     '400ms',
        dramatic: '700ms',
        epic:     '1200ms',
      },
      transitionTimingFunction: {
        'default':  'cubic-bezier(0.4, 0, 0.2, 1)',
        'in':       'cubic-bezier(0.4, 0, 1, 1)',
        'out':      'cubic-bezier(0, 0, 0.2, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'dramatic': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'timer-pulse': {
          'from': { opacity: '1' },
          'to':   { opacity: '0.6' },
        },
        'gold-glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(197,165,90,0.4)' },
          '50%':       { boxShadow: '0 0 20px rgba(197,165,90,0.8)' },
        },
        'invalid-blink': {
          '0%, 100%': { filter: 'brightness(1) saturate(1)' },
          '25%':       { filter: 'brightness(2.5) saturate(3)' },
          '75%':       { filter: 'brightness(2) saturate(2)' },
        },
        'glitch': {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%':           { transform: 'translate(-2px, 1px)' },
          '94%':           { transform: 'translate(2px, -1px)' },
          '96%':           { transform: 'translate(-1px, 2px)' },
        },
        'toast-in': {
          'from': { opacity: '0', transform: 'translateX(-50%) translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
      },
      animation: {
        'timer-pulse':    'timer-pulse 0.8s ease-in-out infinite alternate',
        'gold-glow':      'gold-glow-pulse 2s ease-in-out infinite',
        'invalid-blink':  'invalid-blink 0.5s ease-in-out',
        'glitch':         'glitch 2s infinite',
        'toast-in':       'toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ── SIZING ──────────────────────────────────── */
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      height: {
        nav:          '64px',
        'nav-expanded': '280px',
        topbar:       '56px',
        touch:        '44px',
        'avatar-sm':  '40px',
        'avatar-base': '64px',
        'avatar-lg':  '120px',
        'avatar-hero': '160px',
      },
      width: {
        touch:        '44px',
        'avatar-sm':  '40px',
        'avatar-base': '64px',
        'avatar-lg':  '120px',
        'avatar-hero': '160px',
      },

      /* ── Z-INDEX ─────────────────────────────────── */
      zIndex: {
        'base':     '0',
        'raised':   '10',
        'dropdown': '100',
        'sticky':   '200',
        'overlay':  '500',
        'hacker':   '800',
        'toast':    '900',
        'max':      '9999',
      },
    },
  },
  plugins: [],
}
