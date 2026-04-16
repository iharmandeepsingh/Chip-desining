import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const GateTooltip = ({ gateType, children }) => {
  const { currentTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const gateInfo = {
    INPUT: {
      title: 'Input Gate',
      description: 'Represents a binary input signal that can be toggled between 0 and 1.',
      truthTable: [
        { input: '0', output: '0' },
        { input: '1', output: '1' }
      ],
      usage: 'Use as the starting point for your circuit. Click to toggle between ON/OFF states.',
      color: currentTheme.gateColors.INPUT
    },
    OUTPUT: {
      title: 'Output Gate',
      description: 'Displays the final result of a circuit or sub-circuit.',
      truthTable: [
        { input: '0', output: '0' },
        { input: '1', output: '1' }
      ],
      usage: 'Use to monitor the final output of your circuit. Shows the result of connected logic.',
      color: currentTheme.gateColors.OUTPUT
    },
    AND: {
      title: 'AND Gate',
      description: 'Outputs 1 only when all inputs are 1. Implements logical conjunction.',
      truthTable: [
        { input1: '0', input2: '0', output: '0' },
        { input1: '0', input2: '1', output: '0' },
        { input1: '1', input2: '0', output: '0' },
        { input1: '1', input2: '1', output: '1' }
      ],
      usage: 'Use when you need all conditions to be true. Common in safety systems and validation logic.',
      color: currentTheme.gateColors.AND
    },
    OR: {
      title: 'OR Gate',
      description: 'Outputs 1 when at least one input is 1. Implements logical disjunction.',
      truthTable: [
        { input1: '0', input2: '0', output: '0' },
        { input1: '0', input2: '1', output: '1' },
        { input1: '1', input2: '0', output: '1' },
        { input1: '1', input2: '1', output: '1' }
      ],
      usage: 'Use when you need any condition to be true. Common in alarm systems and option selection.',
      color: currentTheme.gateColors.OR
    },
    NOT: {
      title: 'NOT Gate',
      description: 'Inverts the input signal. Implements logical negation.',
      truthTable: [
        { input: '0', output: '1' },
        { input: '1', output: '0' }
      ],
      usage: 'Use to invert signals. Essential for creating NAND, NOR, and XOR gates.',
      color: currentTheme.gateColors.NOT
    },
    XOR: {
      title: 'XOR Gate',
      description: 'Outputs 1 when inputs are different. Implements exclusive OR.',
      truthTable: [
        { input1: '0', input2: '0', output: '0' },
        { input1: '0', input2: '1', output: '1' },
        { input1: '1', input2: '0', output: '1' },
        { input1: '1', input2: '1', output: '0' }
      ],
      usage: 'Use for addition operations and parity checking. Fundamental in arithmetic circuits.',
      color: currentTheme.gateColors.XOR
    }
  };

  const info = gateInfo[gateType];
  if (!info) return children;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: currentTheme.surface,
            border: `2px solid ${info.color}`,
            borderRadius: '8px',
            padding: '15px',
            minWidth: '300px',
            maxWidth: '400px',
            boxShadow: `0 8px 24px ${currentTheme.shadow}`,
            marginTop: '10px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
              paddingBottom: '10px',
              borderBottom: `1px solid ${currentTheme.border}`,
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: info.color,
                borderRadius: '4px',
                marginRight: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {gateType.charAt(0)}
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: currentTheme.text.primary,
                  marginBottom: '2px',
                }}
              >
                {info.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: currentTheme.text.secondary,
                }}
              >
                {gateType} Gate
              </div>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              marginBottom: '12px',
              fontSize: '14px',
              lineHeight: '1.4',
              color: currentTheme.text.primary,
            }}
          >
            {info.description}
          </div>

          {/* Usage */}
          <div
            style={{
              backgroundColor: `${info.color}20`,
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: info.color,
                marginBottom: '4px',
              }}
            >
              💡 Usage Tip:
            </div>
            <div
              style={{
                fontSize: '13px',
                color: currentTheme.text.primary,
                lineHeight: '1.3',
              }}
            >
              {info.usage}
            </div>
          </div>

          {/* Truth Table */}
          {info.truthTable && (
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: currentTheme.text.primary,
                  marginBottom: '6px',
                }}
              >
                📊 Truth Table:
              </div>
              <div
                style={{
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: currentTheme.surface,
                    borderBottom: `1px solid ${currentTheme.border}`,
                  }}
                >
                  {Object.keys(info.truthTable[0]).map((key, index) => (
                    <div
                      key={key}
                      style={{
                        flex: 1,
                        padding: '8px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        color: currentTheme.text.secondary,
                        borderRight: index < Object.keys(info.truthTable[0]).length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                      }}
                    >
                      {key.toUpperCase()}
                    </div>
                  ))}
                </div>
                
                {/* Table Rows */}
                {info.truthTable.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    style={{
                      display: 'flex',
                      borderBottom: rowIndex < info.truthTable.length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                    }}
                  >
                    {Object.values(row).map((value, colIndex) => (
                      <div
                        key={colIndex}
                        style={{
                          flex: 1,
                          padding: '8px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: value === '1' ? 'bold' : 'normal',
                          color: value === '1' ? info.color : currentTheme.text.primary,
                          borderRight: colIndex < Object.values(row).length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcut */}
          <div
            style={{
              marginTop: '10px',
              padding: '6px',
              backgroundColor: `${currentTheme.primary}10`,
              borderRadius: '4px',
              fontSize: '11px',
              color: currentTheme.text.secondary,
            }}
          >
            ⌨️ Quick Add: Ctrl+{gateType.charAt(0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GateTooltip;
