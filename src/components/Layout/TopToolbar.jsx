import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const TopToolbar = () => {
  const { currentTheme } = useTheme();
  const { addNode } = useCircuitStore();

  const gateButtons = [
    {
      type: 'INPUT',
      label: 'INPUT',
      color: currentTheme.gateColors.INPUT || '#3B82F6',
      shortcut: 'Ctrl+I',
      icon: '📥',
    },
    {
      type: 'AND',
      label: 'AND',
      color: currentTheme.gateColors.AND || '#10B981',
      shortcut: 'Ctrl+A',
      icon: '∧',
    },
    {
      type: 'OR',
      label: 'OR',
      color: currentTheme.gateColors.OR || '#F97316',
      shortcut: 'Ctrl+O',
      icon: '∨',
    },
    {
      type: 'NOT',
      label: 'NOT',
      color: currentTheme.gateColors.NOT || '#8B5CF6',
      shortcut: 'Ctrl+N',
      icon: '¬',
    },
    {
      type: 'OUTPUT',
      label: 'OUTPUT',
      color: currentTheme.gateColors.OUTPUT || '#EF4444',
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
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '100%',
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
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          🚀
        </div>
        <div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              lineHeight: '1.2',
            }}
          >
            Chip Designer
          </div>
          <div
            style={{
              fontSize: '12px',
              color: currentTheme.text.secondary,
              lineHeight: '1.2',
            }}
          >
            Professional Circuit Design Platform
          </div>
        </div>
      </div>

      {/* Gate Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: `${currentTheme.background}20`,
          padding: '8px 16px',
          borderRadius: '12px',
          border: `1px solid ${currentTheme.border}`,
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
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: gate.color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 1px 3px ${gate.color}40`,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)';
              e.target.style.boxShadow = `0 4px 12px ${gate.color}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = `0 1px 3px ${gate.color}40`;
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0) scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <span
              style={{
                fontSize: '16px',
                lineHeight: '1',
              }}
            >
              {gate.icon}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {gate.label}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          title="Clear Canvas (Ctrl+Shift+Delete)"
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: currentTheme.text.secondary,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = currentTheme.error;
            e.target.style.color = 'white';
            e.target.style.borderColor = currentTheme.error;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = currentTheme.text.secondary;
            e.target.style.borderColor = currentTheme.border;
          }}
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default TopToolbar;
