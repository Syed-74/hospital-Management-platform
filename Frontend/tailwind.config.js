/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--color-primary, #0D9488)',
          secondary: 'var(--color-secondary, #0F766E)',
          accent: 'var(--color-accent, #10B981)',
          sidebar: 'var(--color-sidebar, #FFFFFF)',
          'sidebar-text': 'var(--color-sidebar-text, #374151)',
          header: 'var(--color-header, #FFFFFF)',
          'header-text': 'var(--color-header-text, #111827)',
          bg: 'var(--color-bg, #F8FAFC)',
          card: 'var(--color-card, #FFFFFF)',
          border: 'var(--color-border, #E5E7EB)',
          button: 'var(--color-button, #0D9488)',
          'button-text': 'var(--color-button-text, #FFFFFF)',
          link: 'var(--color-link, #0D9488)',
          success: 'var(--color-success, #22C55E)',
          warning: 'var(--color-warning, #F59E0B)',
          error: 'var(--color-error, #EF4444)'
        }
      },
      fontFamily: {
        sans: ['var(--font-family, Inter)', 'sans-serif'],
      },
      borderRadius: {
        theme: 'var(--border-radius, 8px)'
      }
    },
  },
  plugins: [],
}