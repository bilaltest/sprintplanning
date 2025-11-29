/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette inspirée Crédit Agricole - version moderne/pastel
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bce5cd',
          300: '#8dd1ad',
          400: '#5bb889',
          500: '#339966', // Vert CA principal
          600: '#2a7d54',
          700: '#226344',
          800: '#1d4f37',
          900: '#18412e',
        },
        accent: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#fecfc9',
          300: '#fcaea4',
          400: '#f87f6f',
          500: '#ef5a45',
          600: '#dc3d26',
          700: '#b9311c',
          800: '#992d1b',
          900: '#7f2c1d',
        },
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
