// Shared Tailwind (Play CDN) config — load right after https://cdn.tailwindcss.com
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Space Grotesk', 'sans-serif'], arabic: ['Cairo', 'sans-serif'] },
      colors: {
        space: { 900: '#0B0D17', 800: '#151932', accent: '#00F0FF', nebula: '#7000FF' }
      }
    }
  }
};
