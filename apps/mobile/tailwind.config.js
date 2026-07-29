/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: "#f3ede2", // app background (was screen-grouped)
        surface: "#fffaf2", // cards, sheets, inputs (was glass-surface / surface-container*)
        "surface-muted": "#f4ede2", // table headers, subtle fills (was table-header-bg)

        // Text
        foreground: "#2f332f", // primary text (was label-primary / on-surface / on-background)
        "muted-foreground": "#747870", // secondary/meta text (was label-muted / time-muted / on-surface-variant)

        // Structure
        border: "#b8b3aa", // default border (was outline) — use border/40 etc. for subtle dividers, replaces separator*

        // Brand
        primary: "#5f7d67", // was forest
        "primary-foreground": "#fffaf2", // text/icons on primary (was on-primary)
        "primary-strong": "#31463a", // hero/emphasis surface, e.g. revenue card (was revenue-hero)

        // Secondary accent (focus panels, highlights)
        accent: "#7b61ff", // was accent-focus
        "accent-foreground": "#fffaf2",

        // Status (reduced to 3)
        success: "#2f8f4e", // completed, in-stock, optimal (was status-completed-* / restock-icon)
        warning: "#f08a24", // pending, low stock (was status-pending-* / accent-warn* / tertiary)
        destructive: "#ba1a1a", // errors, critical, delete actions (was destructive / error / critical*)
      },
      fontFamily: {
        headline: ["Vollkorn_800ExtraBold", "Vollkorn_700Bold", "System"],
        "headline-bold": ["Vollkorn_700Bold", "System"],
        "headline-regular": ["Vollkorn_400Regular", "System"],
        body: ["NotoSans_400Regular", "System"],
        "body-medium": ["NotoSans_500Medium", "System"],
        "body-semibold": ["NotoSans_600SemiBold", "System"],
        "body-bold": ["NotoSans_700Bold", "System"],
        label: ["NotoSans_600SemiBold", "System"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
