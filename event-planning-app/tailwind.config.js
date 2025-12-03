/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Crédit Agricole - Vert identité
        ca: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00a859',  // Vert CA officiel
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Module PLANNING - Vert menthe moderne (calme/apaisant)
        planning: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',  // Primary Planning - Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'planning-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Secondary Planning - Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Module RELEASES - Même palette que Planning (unifiée)
        releases: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',  // Primary Releases - Emerald (comme Planning)
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'releases-secondary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Secondary Releases - Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'releases-alert': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fbbf24',  // Orange plus doux
          500: '#f59e0b',  // Alert/Urgence - Orange pastel (amber)
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Legacy primary (pour compatibilité - mapping vers planning)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Couleurs événements
        event: {
          mep: '#22c55e',      // Vert - Mise en production
          incident: '#ef4444',  // Rouge - Incident
          maintenance: '#f97316', // Orange - Maintenance
          meeting: '#3b82f6',   // Bleu - Réunion
          deadline: '#a855f7',  // Violet - Deadline
          test: '#eab308',      // Jaune - Test
          review: '#06b6d4',    // Cyan - Revue
          training: '#ec4899',  // Rose - Formation
          audit: '#6366f1',     // Indigo - Audit
          release: '#10b981',   // Emerald - Release
          hotfix: '#dc2626',    // Rouge foncé - Hotfix
          planning: '#8b5cf6',  // Violet - Planning
        }
      },

      // Gradients personnalisés
      backgroundImage: {
        'gradient-planning': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-planning-subtle': 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
        'gradient-releases': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-releases-card': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        'gradient-squad-incomplete': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        'gradient-squad-complete': 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        'gradient-action-cta': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },

      // Glassmorphism
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
