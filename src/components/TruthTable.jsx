import React, { useState, useMemo } from 'react';
import useCircuitStore from '../store/useCircuitStore';
import { useTheme } from '../contexts/ThemeContext';

const TruthTable = () => {
  const { nodes, edges, computeNodeValue } = useCircuitStore();
  const { currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Get input nodes
  const inputNodes = useMemo(() => 
    nodes.filter(node => node.data.label === 'INPUT'),
    [nodes]
  );

  // Get output nodes
  const outputNodes = useMemo(() => 
    nodes.filter(node => node.data.label === 'OUTPUT'),
    [nodes]
  );

  // Generate all possible input combinations
  const generateInputCombinations = (numInputs) => {
    if (numInputs === 0) return [[]];
    
    const combinations = [];
    const totalCombinations = Math.pow(2, numInputs);
    
    for (let i = 0; i < totalCombinations; i++) {
      const combination = [];
      for (let j = numInputs - 1; j >= 0; j--) {
        combination.push((i >> j) & 1);
      }
      combinations.push(combination);
    }
    
    return combinations;
  };

  // Compute truth table data
  const truthTableData = useMemo(() => {
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      return [];
    }

    const combinations = generateInputCombinations(inputNodes.length);
    
    return combinations.map(combination => {
      // Temporarily set input values
      const originalValues = {};
      inputNodes.forEach((node, index) => {
        originalValues[node.id] = node.data.value;
        node.data.value = Boolean(combination[index]);
      });

      // Calculate outputs
      const outputs = outputNodes.map(node => ({
        id: node.id,
        label: node.data.label,
        value: computeNodeValue(node.id) ? 1 : 0
      }));

      // Restore original values
      inputNodes.forEach(node => {
        node.data.value = originalValues[node.id];
      });

      return {
        inputs: combination,
        outputs: outputs
      };
    });
  }, [inputNodes, outputNodes, computeNodeValue]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          padding: '12px 24px',
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`,
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: `0 4px 16px ${currentTheme.primary}40`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = `0 8px 24px ${currentTheme.primary}60`;
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = `0 4px 16px ${currentTheme.primary}40`;
        }}
      >
        <span style={{ fontSize: '18px' }}>📊</span>
        Generate Truth Table
      </button>
    );
  }

  return (
    <div
      style={{
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? '50%' : 'auto',
        left: isMaximized ? '50%' : 'auto',
        transform: isMaximized ? 'translate(-50%, -50%)' : 'none',
        background: `linear-gradient(135deg, ${currentTheme.surface}, ${currentTheme.surfaceHover})`,
        padding: isMaximized ? '40px' : '24px',
        borderRadius: isMaximized ? '20px' : '16px',
        boxShadow: isMaximized 
          ? `0 20px 60px ${currentTheme.shadow.xl}, 0 0 120px ${currentTheme.primary}20`
          : `0 8px 32px ${currentTheme.shadow.lg}`,
        zIndex: isMaximized ? 2000 : 1,
        maxHeight: isMaximized ? '90vh' : '600px',
        width: isMaximized ? '90vw' : '100%',
        overflow: 'auto',
        border: `2px solid ${currentTheme.border}40`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `2px solid ${currentTheme.border}40`
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            color: currentTheme.text.primary,
            fontSize: '24px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>📊</span>
            Truth Table Analysis
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: currentTheme.text.secondary,
            fontSize: '14px'
          }}>
            Complete logic analysis for {inputNodes.length} input(s) × {outputNodes.length} output(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              background: `${currentTheme.surface}80`,
              color: currentTheme.text.secondary,
              border: `2px solid ${currentTheme.border}60`,
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${currentTheme.primary}20`;
              e.target.style.borderColor = currentTheme.primary;
              e.target.style.color = currentTheme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `${currentTheme.surface}80`;
              e.target.style.borderColor = `${currentTheme.border}60`;
              e.target.style.color = currentTheme.text.secondary;
            }}
          >
            {isMaximized ? '⛶ Minimize' : '⛶ Maximize'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentHover})`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: `0 2px 8px ${currentTheme.accent}40`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 16px ${currentTheme.accent}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${currentTheme.accent}40`;
            }}
          >
            Close
          </button>
        </div>
      </div>

      {inputNodes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: `${currentTheme.surface}40`,
          borderRadius: '16px',
          border: `2px dashed ${currentTheme.border}60`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: currentTheme.text.primary,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            No Circuit Data Available
          </h3>
          <p style={{ 
            margin: 0, 
            color: currentTheme.text.secondary,
            fontSize: '14px'
          }}>
            Add INPUT and OUTPUT nodes to generate a comprehensive truth table
          </p>
        </div>
      ) : (
        <div>
          <div style={{ 
            marginBottom: '20px', 
            padding: '16px',
            background: `${currentTheme.primary}10`,
            borderRadius: '12px',
            border: `2px solid ${currentTheme.primary}30`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: currentTheme.primary,
                marginBottom: '4px'
              }}>
                Circuit Configuration
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: currentTheme.text.secondary
              }}>
                {inputNodes.length} input(s) × {outputNodes.length} output(s) = {Math.pow(2, inputNodes.length)} combinations
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '16px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: currentTheme.primary
                }}>
                  {inputNodes.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Inputs
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: currentTheme.secondary
                }}>
                  {outputNodes.length}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Outputs
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            background: currentTheme.surface,
            borderRadius: '16px',
            overflow: 'hidden',
            border: `2px solid ${currentTheme.border}40`,
            boxShadow: `0 4px 16px ${currentTheme.shadow.md}`
          }}>
          
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ 
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                color: 'white'
              }}>
                {inputNodes.map(node => (
                  <th
                    key={node.id}
                    style={{
                      border: `1px solid ${currentTheme.primary}40`,
                      padding: '16px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {node.data.label}
                  </th>
                ))}
                {outputNodes.map(node => (
                  <th
                    key={node.id}
                    style={{
                      border: `1px solid ${currentTheme.secondary}40`,
                      padding: '16px 12px',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {node.data.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {truthTableData.map((row, index) => (
                <tr 
                  key={index} 
                  style={{ 
                    background: index % 2 === 0 
                      ? `${currentTheme.background}40` 
                      : currentTheme.surface,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${currentTheme.primary}10`;
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 
                      ? `${currentTheme.background}40` 
                      : currentTheme.surface;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {row.inputs.map((input, inputIndex) => (
                    <td
                      key={inputIndex}
                      style={{
                        border: `1px solid ${currentTheme.border}40`,
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: input ? '700' : '400',
                        color: input ? currentTheme.primary : currentTheme.text.secondary,
                        background: input ? `${currentTheme.primary}15` : 'transparent',
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {input}
                    </td>
                  ))}
                  {row.outputs.map((output, outputIndex) => (
                    <td
                      key={outputIndex}
                      style={{
                        border: `1px solid ${currentTheme.border}40`,
                        padding: '12px 8px',
                        textAlign: 'center',
                        fontWeight: output.value ? '700' : '400',
                        background: output.value ? `${currentTheme.success}20` : 'transparent',
                        color: output.value ? currentTheme.success : currentTheme.text.secondary,
                        fontSize: '13px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {output.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div style={{ 
            marginTop: '24px', 
            padding: '16px',
            background: `${currentTheme.surface}60`,
            borderRadius: '12px',
            border: `2px solid ${currentTheme.border}40`
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📖</span>
              Legend & Analysis
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: currentTheme.text.secondary
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: `${currentTheme.primary}20`,
                  border: `2px solid ${currentTheme.primary}`,
                  borderRadius: '4px',
                  fontWeight: '700',
                  color: currentTheme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>1</div>
                <span>Input Logic High</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: currentTheme.text.secondary
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: `${currentTheme.success}20`,
                  border: `2px solid ${currentTheme.success}`,
                  borderRadius: '4px',
                  fontWeight: '700',
                  color: currentTheme.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>1</div>
                <span>Output Logic High</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: currentTheme.text.secondary
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: 'transparent',
                  border: `2px solid ${currentTheme.border}60`,
                  borderRadius: '4px',
                  fontWeight: '400',
                  color: currentTheme.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>0</div>
                <span>Logic Low</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthTable;
