/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        brand: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          accent: '#2563eb',
          'accent-light': '#eff6ff',
        },
        stock: {
          ok: '#16a34a',
          'ok-bg': '#ecfdf5',
          low: '#d97706',
          'low-bg': '#fffbeb',
          out: '#dc2626',
          'out-bg': '#fef2f2',
        },
      },
      borderRadius: {
        card: '18px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
