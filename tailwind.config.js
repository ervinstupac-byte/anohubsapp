// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // OVO JE KRITIČNO: Tailwind mora znati gdje tražiti klase.
  content: [
    "./index.html", 
    // Skenira sve fajlove s ekstenzijom .js, .ts, .jsx, .tsx unutar src/
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      // Ovdje se dodaju custom boje, fontovi, itd.
    },
  },
  plugins: [],
}