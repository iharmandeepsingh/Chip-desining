import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme, currentTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px',
        backgroundColor: currentTheme.surface,
        color: currentTheme.text.primary,
        border: `2px solid ${currentTheme.border}`,
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '18px',
        boxShadow: `0 2px 8px ${currentTheme.shadow}`,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = `0 4px 12px ${currentTheme.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow}`;
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
