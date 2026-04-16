import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitExport from '../hooks/useCircuitExport';

const CircuitExport = () => {
  const { currentTheme } = useTheme();
  const { exportAsSVG, exportAsPNG, exportAsJSON, canExport } = useCircuitExport();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  if (!canExport) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        zIndex: 1000,
      }}
    >
      {/* Export Button */}
      <button
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
        style={{
          padding: '8px 12px',
          backgroundColor: currentTheme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: `0 2px 8px ${currentTheme.shadow}`,
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = `0 4px 12px ${currentTheme.shadow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow}`;
        }}
      >
        📥 Export
      </button>

      {/* Export Menu */}
      {isExportMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '5px',
            backgroundColor: currentTheme.surface,
            border: `2px solid ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '8px',
            minWidth: '180px',
            boxShadow: `0 4px 12px ${currentTheme.shadow}`,
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${currentTheme.border}`,
            }}
          >
            Export Circuit As:
          </div>

          {/* SVG Export */}
          <button
            onClick={() => {
              exportAsSVG();
              setIsExportMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: currentTheme.text.primary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              marginBottom: '6px',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${currentTheme.primary}20`;
              e.target.style.borderColor = currentTheme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = currentTheme.border;
            }}
          >
            📄 SVG (Vector Graphics)
            <div
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
                marginTop: '2px',
              }}
            >
              Best for editing and scaling
            </div>
          </button>

          {/* PNG Export */}
          <button
            onClick={() => {
              exportAsPNG();
              setIsExportMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: currentTheme.text.primary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              marginBottom: '6px',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${currentTheme.primary}20`;
              e.target.style.borderColor = currentTheme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = currentTheme.border;
            }}
          >
            🖼️ PNG (Image)
            <div
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
                marginTop: '2px',
              }}
            >
              Perfect for sharing and documents
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={() => {
              exportAsJSON();
              setIsExportMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: currentTheme.text.primary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              marginBottom: '6px',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${currentTheme.primary}20`;
              e.target.style.borderColor = currentTheme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = currentTheme.border;
            }}
          >
            📋 JSON (Data)
            <div
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
                marginTop: '2px',
              }}
            >
              Save circuit structure for later import
            </div>
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => setIsExportMenuOpen(false)}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: 'transparent',
              color: currentTheme.text.secondary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${currentTheme.text.secondary}10`;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CircuitExport;
