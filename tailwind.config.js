/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        s1: '#0D0D0D',
        s2: '#111111',
        s3: '#1A1A1A',
        s4: '#222222',
        s5: '#2E2E2E',
        w1: '#FFFFFF',
        w2: '#E8E8E8',
        w3: '#A0A0A0',
        w4: '#606060',
        w5: '#3A3A3A',
        candor: {
          blue: '#4B7BFF',
          green: '#23D160',
          amber: '#F59E0B',
          red: '#F87171',
          purple: '#A78BFA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      }
    },
  },
  plugins: [],
}
