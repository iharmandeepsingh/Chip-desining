import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// ✅ Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// ✅ Provider
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("chipDesigner_theme");
    return savedTheme ? savedTheme === "dark" : true; // Default to dark theme
  });

  // Premium Dark Theme - VS Code/Figma Quality
  const themes = {
    light: {
      name: "light",
      background: "#ffffff",
      surface: "#f8fafc",
      surfaceHover: "#f1f5f9",
      border: "#e2e8f0",
      borderLight: "#f1f5f9",
      text: {
        primary: "#0f172a",
        secondary: "#64748b",
        tertiary: "#94a3b8",
        inverse: "#ffffff",
      },
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      secondary: "#10b981",
      secondaryHover: "#059669",
      accent: "#f59e0b",
      accentHover: "#d97706",
      success: "#22c55e",
      successHover: "#16a34a",
      error: "#ef4444",
      errorHover: "#dc2626",
      warning: "#f59e0b",
      warningHover: "#d97706",
      info: "#3b82f6",
      infoHover: "#2563eb",
      shadow: {
        sm: 'rgba(0, 0, 0, 0.05)',
        md: 'rgba(0, 0, 0, 0.08)',
        lg: 'rgba(0, 0, 0, 0.12)',
        xl: 'rgba(0, 0, 0, 0.16)',
      },
      gateColors: {
        INPUT: "#3b82f6",
        OUTPUT: "#ef4444",
        AND: "#10b981",
        OR: "#f97316",
        NOT: "#8b5cf6",
        XOR: "#6366f1",
        NAND: "#f59e0b",
        NOR: "#fbbf24",
        XNOR: "#6366f1",
        D_FLIP_FLOP: "#8b5cf6",
        JK_FLIP_FLOP: "#10b981",
        CLOCK: "#f59e0b",
        COUNTER: "#22c55e",
        SEQUENTIAL: "#8b5cf6",
        MULTIPLEXER: "#f97316",
        DECODER: "#10b981",
      },
      canvas: "#f8fafc",
      canvasBorder: "#e2e8f0",
      grid: "rgba(0, 0, 0, 0.05)",
      gridMajor: "rgba(0, 0, 0, 0.1)",
      scrollbar: {
        track: "#f1f5f9",
        thumb: "#cbd5e1",
        thumbHover: "#94a3b8",
      },
    },

    dark: {
      name: "dark",
      background: "#0f172a",
      surface: "#1e293b",
      surfaceHover: "#334155",
      border: "#334155",
      borderLight: "#475569",
      text: {
        primary: "#f8fafc",
        secondary: "#cbd5e1",
        tertiary: "#94a3b8",
        inverse: "#0f172a",
      },
      primary: "#3b82f6",
      primaryHover: "#60a5fa",
      secondary: "#10b981",
      secondaryHover: "#34d399",
      accent: "#f59e0b",
      accentHover: "#fbbf24",
      success: "#22c55e",
      successHover: "#4ade80",
      error: "#ef4444",
      errorHover: "#f87171",
      warning: "#f59e0b",
      warningHover: "#fbbf24",
      info: "#3b82f6",
      infoHover: "#60a5fa",
      shadow: {
        sm: 'rgba(0, 0, 0, 0.1)',
        md: 'rgba(0, 0, 0, 0.25)',
        lg: 'rgba(0, 0, 0, 0.35)',
        xl: 'rgba(0, 0, 0, 0.45)',
      },
      gateColors: {
        INPUT: "#60a5fa",
        OUTPUT: "#f87171",
        AND: "#34d399",
        OR: "#fb923c",
        NOT: "#a78bfa",
        XOR: "#818cf8",
        NAND: "#fbbf24",
        NOR: "#fde047",
        XNOR: "#818cf8",
        D_FLIP_FLOP: "#a78bfa",
        JK_FLIP_FLOP: "#34d399",
        CLOCK: "#fbbf24",
        COUNTER: "#4ade80",
        SEQUENTIAL: "#a78bfa",
        MULTIPLEXER: "#fb923c",
        DECODER: "#34d399",
      },
      canvas: "#0f172a",
      canvasBorder: "#1e293b",
      grid: "rgba(255, 255, 255, 0.08)",
      gridMajor: "rgba(255, 255, 255, 0.12)",
      scrollbar: {
        track: "#1e293b",
        thumb: "#475569",
        thumbHover: "#64748b",
      },
    },
  };

  // 🔁 Current theme
  const currentTheme = themes[isDark ? "dark" : "light"];

  // 🌗 Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem(
      "chipDesigner_theme",
      newTheme ? "dark" : "light"
    );
  };

  // Apply theme globally (CSS variables)
  useEffect(() => {
    const root = document.documentElement;

    // Debug: Log current theme
    console.log('Applying theme:', isDark ? 'dark' : 'light', currentTheme);

    // Background colors
    root.style.setProperty("--bg-primary", currentTheme.background);
    root.style.setProperty("--bg-surface", currentTheme.surface);
    root.style.setProperty("--bg-surface-hover", currentTheme.surfaceHover);
    root.style.setProperty("--color-border", currentTheme.border);
    root.style.setProperty("--color-border-light", currentTheme.borderLight);

    // Text colors
    root.style.setProperty("--color-text-primary", currentTheme.text.primary);
    root.style.setProperty("--color-text-secondary", currentTheme.text.secondary);
    root.style.setProperty("--color-text-tertiary", currentTheme.text.tertiary);
    root.style.setProperty("--color-text-inverse", currentTheme.text.inverse);

    // Brand colors
    root.style.setProperty("--color-primary", currentTheme.primary);
    root.style.setProperty("--color-primary-hover", currentTheme.primaryHover);
    root.style.setProperty("--color-secondary", currentTheme.secondary);
    root.style.setProperty("--color-secondary-hover", currentTheme.secondaryHover);
    root.style.setProperty("--color-accent", currentTheme.accent);
    root.style.setProperty("--color-accent-hover", currentTheme.accentHover);

    // Status colors
    root.style.setProperty("--color-success", currentTheme.success);
    root.style.setProperty("--color-success-hover", currentTheme.successHover);
    root.style.setProperty("--color-error", currentTheme.error);
    root.style.setProperty("--color-error-hover", currentTheme.errorHover);
    root.style.setProperty("--color-warning", currentTheme.warning);
    root.style.setProperty("--color-warning-hover", currentTheme.warningHover);
    root.style.setProperty("--color-info", currentTheme.info);
    root.style.setProperty("--color-info-hover", currentTheme.infoHover);

    // Shadows
    root.style.setProperty("--shadow-sm", currentTheme.shadow.sm);
    root.style.setProperty("--shadow-md", currentTheme.shadow.md);
    root.style.setProperty("--shadow-lg", currentTheme.shadow.lg);
    root.style.setProperty("--shadow-xl", currentTheme.shadow.xl);

    // Canvas colors
    root.style.setProperty("--canvas-bg", currentTheme.canvas);
    root.style.setProperty("--canvas-border", currentTheme.canvasBorder);
    root.style.setProperty("--canvas-grid", currentTheme.grid);
    root.style.setProperty("--canvas-grid-major", currentTheme.gridMajor);

    // Scrollbar colors
    root.style.setProperty("--scrollbar-track", currentTheme.scrollbar.track);
    root.style.setProperty("--scrollbar-thumb", currentTheme.scrollbar.thumb);
    root.style.setProperty("--scrollbar-thumb-hover", currentTheme.scrollbar.thumbHover);

    // Gate colors
    Object.entries(currentTheme.gateColors).forEach(([gate, color]) => {
      root.style.setProperty(`--gate-${gate.toLowerCase()}`, color);
    });
  }, [currentTheme, isDark]);

  // ✅ Context value
  const value = {
    isDark,
    currentTheme,
    toggleTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};