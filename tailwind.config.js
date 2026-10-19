/** NATS — Tailwind build config (replaces the Play CDN). */
module.exports = {
  content: ['./*.html', './assets/*.js'],
  theme: {
    extend: {
      colors: {
        accent: '#7a5c3c', coral: '#c9a06a', cream: '#f3ede3', sand: '#e9e1d4',
        espresso: '#1e1811', warm: '#2a2118', body: '#4a4034', taupe: '#7a6f60',
        bone: '#f3ede3', ink: '#181615',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"Manrope"', 'sans-serif'],
      },
    },
  },
};
