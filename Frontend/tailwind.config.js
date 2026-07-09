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
          primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
          accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          sidebar: 'rgb(var(--color-sidebar-rgb) / <alpha-value>)',
          'sidebar-text': 'rgb(var(--color-sidebar-text-rgb) / <alpha-value>)',
          header: 'rgb(var(--color-header-rgb) / <alpha-value>)',
          'header-text': 'rgb(var(--color-header-text-rgb) / <alpha-value>)',
          bg: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
          card: 'rgb(var(--color-card-rgb) / <alpha-value>)',
          border: 'rgb(var(--color-border-rgb) / <alpha-value>)',
          button: 'rgb(var(--color-button-rgb) / <alpha-value>)',
          'button-text': 'rgb(var(--color-button-text-rgb) / <alpha-value>)',
          link: 'rgb(var(--color-link-rgb) / <alpha-value>)',
          success: 'rgb(var(--color-success-rgb) / <alpha-value>)',
          warning: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
          error: 'rgb(var(--color-error-rgb) / <alpha-value>)'
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