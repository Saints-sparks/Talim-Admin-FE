import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#003366",
          hover:   "#002244",
          light:   "#EAF2FB",
          border:  "#D7E6F6",
          "50":    "#EAF2FB",
          "100":   "#D7E6F6",
          "700":   "#003366",
          "800":   "#002244",
        },
        talim: {
          bg:      "#F8F8F8",
          sidebar: "#FBFBFB",
          divider: "#F1F1F1",
          text:    "#030E18",
          muted:   "#6F6F6F",
        },
        // Shared platform tokens (the portals' `tl` set): CSS variables in globals.css.
        tl: {
          bg: "rgb(var(--tl-bg) / <alpha-value>)",
          surface: "rgb(var(--tl-surface) / <alpha-value>)",
          subtle: "rgb(var(--tl-subtle) / <alpha-value>)",
          ink: "rgb(var(--tl-ink) / <alpha-value>)",
          body: "rgb(var(--tl-body) / <alpha-value>)",
          muted: "rgb(var(--tl-muted) / <alpha-value>)",
          faint: "rgb(var(--tl-faint) / <alpha-value>)",
          line: "rgb(var(--tl-line) / <alpha-value>)",
          "line-soft": "rgb(var(--tl-line-soft) / <alpha-value>)",
          control: "rgb(var(--tl-control) / <alpha-value>)",
          brand: "rgb(var(--tl-brand) / <alpha-value>)",
          "brand-fill": "rgb(var(--tl-brand-fill) / <alpha-value>)",
          "brand-fill-hover": "rgb(var(--tl-brand-fill-hover) / <alpha-value>)",
          "on-brand": "rgb(var(--tl-on-brand) / <alpha-value>)",
          link: "rgb(var(--tl-link) / <alpha-value>)",
          select: "rgb(var(--tl-select) / <alpha-value>)",
          track: "rgb(var(--tl-track) / <alpha-value>)",
          success: "rgb(var(--tl-success) / <alpha-value>)",
          "success-bg": "rgb(var(--tl-success-bg) / <alpha-value>)",
          warning: "rgb(var(--tl-warning) / <alpha-value>)",
          "warning-bg": "rgb(var(--tl-warning-bg) / <alpha-value>)",
          danger: "rgb(var(--tl-danger) / <alpha-value>)",
          "danger-bg": "rgb(var(--tl-danger-bg) / <alpha-value>)",
          accent: "rgb(var(--tl-accent) / <alpha-value>)",
          "accent-bg": "rgb(var(--tl-accent-bg) / <alpha-value>)",
        },
        // The current avatar tone, set by a `.tl-tone-N` class on the element.
        tone: {
          bg: "rgb(var(--tone-bg) / <alpha-value>)",
          fg: "rgb(var(--tone-fg) / <alpha-value>)",
          bd: "rgb(var(--tone-bd) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
