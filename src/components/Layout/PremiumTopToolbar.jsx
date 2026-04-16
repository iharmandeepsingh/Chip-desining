import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const PremiumTopToolbar = () => {
  const { currentTheme } = useTheme();
  const { addNode } = useCircuitStore();
  const [showMoreTools, setShowMoreTools] = useState(false);

  const gateButtons = [
    {
      type: 'INPUT',
      label: 'INPUT',
      color: currentTheme.gateColors.INPUT,
      shortcut: 'Ctrl+I',
      icon: 'I',
    },
    {
      type: 'AND',
      label: 'AND',
      color: currentTheme.gateColors.AND,
      shortcut: 'Ctrl+A',
      icon: '&',
    },
    {
      type: 'OR',
      label: 'OR',
      color: currentTheme.gateColors.OR,
      shortcut: 'Ctrl+O',
      icon: 'OR',
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
      icon: 'O',
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
        height: '64px',
        backgroundColor: currentTheme.surface,
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        position: 'relative',
        zIndex: 100,
        boxShadow: `0 1px 3px ${currentTheme.shadow.sm}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflow: 'hidden',
      }}
    >
      {/* Logo and Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: 'auto',
          flexShrink: 0,
          maxWidth: '200px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            color: 'white',
            boxShadow: `0 3px 10px ${currentTheme.primary}40`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'rotate(5deg) scale(1.05)';
            e.target.style.boxShadow = `0 5px 15px ${currentTheme.primary}60`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'rotate(0deg) scale(1)';
            e.target.style.boxShadow = `0 3px 10px ${currentTheme.primary}40`;
          }}
        >
          <span style={{ transform: 'rotate(-15deg)' }}>C</span>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: currentTheme.text.primary,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Chip Designer
          </div>
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.tertiary,
              lineHeight: '1.2',
              letterSpacing: '0.04em',
              fontWeight: '500',
            }}
          >
            Professional Circuit Design Platform
          </div>
        </div>
      </div>

      {/* Essential Gate Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
          flex: '1',
          margin: '0 8px',
          minWidth: 0,
          justifyContent: 'flex-start',
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
              padding: '6px 8px',
              backgroundColor: gate.color,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: '50px',
              height: '32px',
              boxShadow: `0 1px 3px ${gate.color}40`,
              position: 'relative',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              flex: '0 0 auto',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = `0 4px 12px ${gate.color}60`;
              e.target.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = `0 2px 8px ${gate.color}40`;
              e.target.style.filter = 'brightness(1)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0) scale(0.98)';
              e.target.style.filter = 'brightness(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.filter = 'brightness(1.1)';
            }}
          >
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '700',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              {gate.icon}
            </span>
            <span style={{
              letterSpacing: '0.01em',
              fontSize: '9px',
            }}>{gate.label}</span>
          </button>
        ))}

        {/* More Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMoreTools(!showMoreTools)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showMoreTools ? currentTheme.primaryHover : 'transparent',
              color: showMoreTools ? currentTheme.text.inverse : currentTheme.text.secondary,
              border: `1px solid ${showMoreTools ? currentTheme.primaryHover : currentTheme.border}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              height: '40px',
              boxShadow: showMoreTools ? `0 4px 12px ${currentTheme.primaryHover}40` : 'none',
            }}
            onMouseEnter={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = currentTheme.surfaceHover;
                e.target.style.color = currentTheme.text.primary;
                e.target.style.borderColor = currentTheme.borderLight;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${currentTheme.shadow.md}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = currentTheme.text.secondary;
                e.target.style.borderColor = currentTheme.border;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: '700' }}>···</span>
            <span>Tools</span>
          </button>

          {showMoreTools && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '12px',
                boxShadow: `0 8px 24px ${currentTheme.shadow.lg}`,
                padding: '8px',
                minWidth: '180px',
                zIndex: 2000,
                animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '14px' }}>AI</span>
                <span>AI Generator</span>
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '2px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '14px' }}>T</span>
                <span>Templates</span>
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'transparent',
                  color: currentTheme.text.primary,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '2px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '14px' }}>F</span>
                <span>Files</span>
              </button>
              <div style={{ height: '1px', backgroundColor: currentTheme.border, margin: '8px 0' }} />
              <button
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: `${currentTheme.error}15`,
                  color: currentTheme.error,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = currentTheme.error;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.error}15`;
                  e.target.style.color = currentTheme.error;
                }}
              >
                <span style={{ fontSize: '14px' }}>×</span>
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumTopToolbar;
