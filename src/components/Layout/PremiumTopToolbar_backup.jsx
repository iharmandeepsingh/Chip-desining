import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const PremiumTopToolbar = () => {
  const { currentTheme } = useTheme();
  const { addNode, nodes, edges } = useCircuitStore();
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

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

  const handleAdvancedGate = (gateType) => {
    const newNode = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'gate',
      position: {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 150,
      },
      data: {
        label: gateType,
        value: false,
      },
    };
    addNode(newNode);
    setShowMoreTools(false);
  };

  const handleAutoLayout = () => {
    // Simple auto-layout algorithm
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    const logicNodes = nodes.filter(n => !['INPUT', 'OUTPUT'].includes(n.data.label));
    
    let yOffset = 100;
    const spacing = 120;
    
    // Position inputs on the left
    inputNodes.forEach((node, index) => {
      node.position = { x: 100, y: yOffset + index * spacing };
    });
    
    // Position logic gates in the middle
    const middleX = 400;
    logicNodes.forEach((node, index) => {
      node.position = { x: middleX, y: yOffset + index * spacing };
    });
    
    // Position outputs on the right
    outputNodes.forEach((node, index) => {
      node.position = { x: 700, y: yOffset + index * spacing };
    });
    
    setShowMoreTools(false);
  };

  const handleCircuitAnalyzer = () => {
    setShowAnalyzer(true);
    setShowMoreTools(false);
  };

  const handleExportCircuit = () => {
    const circuitData = {
      nodes: nodes,
      edges: edges,
      timestamp: new Date().toISOString(),
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        inputCount: nodes.filter(n => n.data.label === 'INPUT').length,
        outputCount: nodes.filter(n => n.data.label === 'OUTPUT').length,
      }
    };
    
    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowMoreTools(false);
  };

  const handleImportCircuit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const circuitData = JSON.parse(e.target.result);
            // Import logic here - would need store methods to set nodes and edges
            console.log('Circuit imported:', circuitData);
          } catch (error) {
            console.error('Failed to import circuit:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setShowMoreTools(false);
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
              color: '#1f2937',
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
            onClick={() => {
              console.log('Tools button clicked, current state:', showMoreTools);
              setShowMoreTools(!showMoreTools);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showMoreTools ? '#4a90e2' : 'transparent',
              color: showMoreTools ? 'white' : '#666',
              border: `1px solid ${showMoreTools ? '#4a90e2' : '#ddd'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              height: '40px',
              boxShadow: showMoreTools ? '0 4px 12px rgba(74, 144, 226, 0.4)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.color = '#333';
                e.target.style.borderColor = '#ccc';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showMoreTools) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#666';
                e.target.style.borderColor = '#ddd';
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
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '8px',
                zIndex: 2000,
                animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                gap: '8px',
                minWidth: '600px',
              }}
            >
              <button
                onClick={() => handleAdvancedGate('XOR')}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e3f2fd';
                  e.target.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>⊕</span>
                <span>XOR</span>
              </button>
              <button
                onClick={() => handleAdvancedGate('NAND')}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e3f2fd';
                  e.target.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>⊼</span>
                <span>NAND</span>
              </button>
              <button
                onClick={() => handleAdvancedGate('NOR')}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e3f2fd';
                  e.target.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>⊽</span>
                <span>NOR</span>
              </button>
              <button
                onClick={() => handleAdvancedGate('XNOR')}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e3f2fd';
                  e.target.style.borderColor = '#1976d2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>⊙</span>
                <span>XNOR</span>
              </button>
              <div style={{ height: '1px', backgroundColor: '#ddd', margin: '8px 0', width: '100%' }} />
              <div style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: '100%',
                borderBottom: '1px solid #ddd',
                paddingBottom: '4px',
                marginBottom: '4px',
              }}>
                Analysis Tools
              </div>
              <button
                onClick={handleCircuitAnalyzer}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3e8ff';
                  e.target.style.borderColor = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>📊</span>
                <span>Analyzer</span>
              </button>
              <button
                onClick={handleAutoLayout}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3e8ff';
                  e.target.style.borderColor = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>📐</span>
                <span>Layout</span>
              </button>
              <div style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: '600',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                width: '100%',
                borderBottom: '1px solid #ddd',
                paddingBottom: '4px',
                marginBottom: '4px',
              }}>
                File Operations
              </div>
              <button
                onClick={handleExportCircuit}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                  e.target.style.borderColor = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>💾</span>
                <span>Export</span>
              </button>
              <button
                onClick={handleImportCircuit}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                  e.target.style.borderColor = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>📁</span>
                <span>Import</span>
              </button>
              <button
                onClick={() => {
                  console.log('Clear canvas clicked');
                  // Add clear logic here if needed
                }}
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                  e.target.style.borderColor = '#d32f2f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#ddd';
                }}
              >
                <span style={{ fontSize: '12px' }}>×</span>
                <span>Clear</span>
              </button>
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                  e.target.style.color = '#d32f2f';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                  e.target.style.color = '#d32f2f';
                }}
              >
                <span style={{ fontSize: '14px' }}>×</span>
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Circuit Analyzer Modal */}
      {showAnalyzer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowAnalyzer(false)}
        >
          <div
            style={{
              background: currentTheme.surface,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: `0 20px 60px ${currentTheme.shadow.xl}`,
              border: `2px solid ${currentTheme.border}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>📊</span>
                Circuit Analysis
              </h2>
              <button
                onClick={() => setShowAnalyzer(false)}
                style={{
                  background: `${currentTheme.error}15`,
                  color: currentTheme.error,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#e3f2fd',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #bb86fc',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1976d2',
                  marginBottom: '8px'
                }}>
                  {nodes.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total Components
                </div>
              </div>
              <div style={{
                background: '#f3e8ff',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #91a7ff',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#0ea5e9',
                  marginBottom: '8px'
                }}>
                  {edges.length}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Connections
                </div>
              </div>
            </div>

            <div style={{
              background: '#fafafa',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${currentTheme.border}40`
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Component Breakdown
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].map(gateType => {
                  const count = nodes.filter(n => n.data.label === gateType).length;
                  if (count === 0) return null;
                  return (
                    <div key={gateType} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1f2937'
                      }}>
                        {gateType}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: currentTheme.primary
                      }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '12px',
              border: '2px solid #86efac',
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#16a34a',
                marginBottom: '8px'
              }}>
                Circuit Status: {nodes.length > 0 ? 'Active' : 'Empty'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                {nodes.length === 0 
                  ? 'Add components to start designing your circuit'
                  : edges.length === 0 
                    ? 'Connect components to create a functional circuit'
                    : 'Circuit is ready for simulation'
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumTopToolbar;
