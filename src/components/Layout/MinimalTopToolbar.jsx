import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const MinimalTopToolbar = () => {
  const { currentTheme } = useTheme();
  const { addNode } = useCircuitStore();
  const [showMoreTools, setShowMoreTools] = useState(false);

  const gateButtons = [
    {
      type: 'INPUT',
      label: 'INPUT',
      color: currentTheme.gateColors.INPUT,
      shortcut: 'Ctrl+I',
      icon: '📥',
    },
    {
      type: 'AND',
      label: 'AND',
      color: currentTheme.gateColors.AND,
      shortcut: 'Ctrl+A',
      icon: '∧',
    },
    {
      type: 'OR',
      label: 'OR',
      color: currentTheme.gateColors.OR,
      shortcut: 'Ctrl+O',
      icon: '∨',
    },
    {
      type: 'NOT',
      label: 'NOT',
      color: currentTheme.gateColors.NOT,
      shortcut: 'Ctrl+N',
      icon: '¬',
    },
    {
      type: 'OUTPUT',
      label: 'OUTPUT',
      color: currentTheme.gateColors.OUTPUT,
      shortcut: 'Ctrl+X',
      icon: '📤',
    },
  ];

  const handleAddGate = (gateType) => {
    const newNode = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'gate',
      position: {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 150,
      },
      data: {
        label: gateType,
        value: gateType === 'INPUT' ? false : false,
      },
    };
    addNode(newNode);
  };

  return (
    <div
      style={{
        height: '48px',
        backgroundColor: currentTheme.surface,
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Logo and Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginRight: 'auto',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: currentTheme.primary,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          🚀
        </div>
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              lineHeight: '1.2',
            }}
          >
            Chip Designer
          </div>
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
              lineHeight: '1.2',
            }}
          >
            Professional Circuit Design
          </div>
        </div>
      </div>

      {/* Essential Gate Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {gateButtons.map((gate) => (
          <button
            key={gate.type}
            onClick={() => handleAddGate(gate.type)}
            title={`${gate.label} Gate (${gate.shortcut})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: gate.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: '60px',
              height: '32px',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px) scale(1.05)';
              e.target.style.boxShadow = `0 4px 8px ${gate.color}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = `0 1px 3px ${gate.color}40`;
            }}
          >
            <span style={{ fontSize: '14px' }}>{gate.icon}</span>
            <span>{gate.label}</span>
          </button>
        ))}

        {/* More Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMoreTools(!showMoreTools)}
            style={{
              padding: '6px 10px',
              backgroundColor: showMoreTools ? currentTheme.primary : 'transparent',
              color: showMoreTools ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showMoreTools ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              transition: 'all 0.2s ease',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = currentTheme.primary;
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = currentTheme.text.secondary;
              }
            }}
          >
            <span>⋮</span>
            <span>Tools</span>
          </button>

          {showMoreTools && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                boxShadow: `0 4px 12px ${currentTheme.shadow}`,
                padding: '8px',
                minWidth: '160px',
                zIndex: 1000,
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                🤖 AI Generator
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                📋 Templates
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                💾 Save/Load
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: `${currentTheme.error}20`,
                  color: currentTheme.error,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = currentTheme.error;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.error}20`;
                  e.target.style.color = currentTheme.error;
                }}
              >
                🗑️ Clear Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinimalTopToolbar;
