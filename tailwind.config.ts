import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 80px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        primary: '#0f172a',
        accent: '#F80000',
        'oci-dark': '#00171F',
        'oci-red': '#F80000',
      },
    },
  },
  plugins: [],
};

export default config;
