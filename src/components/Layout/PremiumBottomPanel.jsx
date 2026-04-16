import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import TruthTable from '../TruthTable';
import TimingSimulationPanel from '../TimingSimulationPanel';

const PremiumBottomPanel = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, propagateValues } = useCircuitStore();
  const [activeTab, setActiveTab] = useState('simulation');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: 'S', description: 'Run and analyze circuits' },
    { id: 'timing', label: 'Timing', icon: 'T', description: 'Timing simulation and analysis' },
    { id: 'truth-table', label: 'Truth Table', icon: 'TT', description: 'View truth table' },
  ];

  const handleRun = () => {
    propagateValues();
  };

  const handleStep = () => {
    // Step-by-step simulation logic here
    const nodeOrder = topologicalSort(nodes, edges);
    nodeOrder.forEach((nodeId, index) => {
      setTimeout(() => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const newValue = computeNodeValue(nodeId);
          if (node.data.value !== newValue) {
            updateNode(nodeId, { 
              data: { ...node.data, value: newValue }
            });
          }
        }
      }, index * 200); // 200ms delay between each node
    });
  };

  const handleReset = () => {
    setNodes(nodes.map(node => 
      node.data.label === 'INPUT' 
        ? { ...node, data: { ...node.data, value: false } }
        : node
    ));
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'simulation':
        return (
          <div style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '16px',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={handleRun}
                style={{
                  flex: '0 0 auto',
                  padding: '6px 12px',
                  background: `linear-gradient(135deg, ${currentTheme.success}, ${currentTheme.successHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 1px 3px ${currentTheme.success}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '32px',
                  minWidth: '80px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = `0 6px 16px ${currentTheme.success}60`;
                  e.target.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 3px 10px ${currentTheme.success}40`;
                  e.target.style.filter = 'brightness(1)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(0.98)';
                  e.target.style.filter = 'brightness(0.95)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.filter = 'brightness(1.1)';
                }}
              >
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>Run</span>
              </button>

              <button
                onClick={handleStep}
                style={{
                  flex: '0 0 auto',
                  padding: '6px 12px',
                  background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.secondaryHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 1px 3px ${currentTheme.secondary}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '32px',
                  minWidth: '80px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = `0 6px 16px ${currentTheme.secondary}60`;
                  e.target.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 3px 10px ${currentTheme.secondary}40`;
                  e.target.style.filter = 'brightness(1)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(0.98)';
                  e.target.style.filter = 'brightness(0.95)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.filter = 'brightness(1.1)';
                }}
              >
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>Step</span>
              </button>

              <button
                onClick={handleReset}
                style={{
                  flex: '0 0 auto',
                  padding: '6px 12px',
                  background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentHover})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 1px 3px ${currentTheme.accent}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '32px',
                  minWidth: '80px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = `0 6px 16px ${currentTheme.accent}60`;
                  e.target.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 3px 10px ${currentTheme.accent}40`;
                  e.target.style.filter = 'brightness(1)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(0.98)';
                  e.target.style.filter = 'brightness(0.95)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.filter = 'brightness(1.1)';
                }}
              >
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}>Reset</span>
              </button>
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surfaceHover,
                borderRadius: '8px',
                padding: '12px',
                border: `1px solid ${currentTheme.border}`,
                boxShadow: `0 1px 4px ${currentTheme.shadow.sm}`,
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.text.primary,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '14px' }}>Circuit Status</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: currentTheme.text.tertiary,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '4px',
                  }}>
                    Total Nodes
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: currentTheme.primary,
                    textShadow: `0 1px 2px ${currentTheme.primary}30`,
                  }}>
                    {nodes.length}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: currentTheme.text.tertiary,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '4px',
                  }}>
                    Connections
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: currentTheme.secondary,
                    textShadow: `0 1px 2px ${currentTheme.secondary}30`,
                  }}>
                    {edges.length}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: currentTheme.text.tertiary,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '4px',
                  }}>
                    Active
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: currentTheme.success,
                    textShadow: `0 1px 2px ${currentTheme.success}30`,
                  }}>
                    {nodes.filter(n => n.data.value).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'timing':
        return <TimingSimulationPanel />;
      case 'truth-table':
        return <TruthTable />;
      default:
        return null;
    }
  };

  // Helper function for topological sort
  function topologicalSort(nodes, edges) {
    const graph = {};
    const inDegree = {};
    const result = [];
    
    // Initialize graph
    nodes.forEach(node => {
      graph[node.id] = [];
      inDegree[node.id] = 0;
    });
    
    // Build graph and calculate in-degrees
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    });
    
    // Queue nodes with no dependencies
    const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
    
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);
      
      graph[current].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    return result;
  }

  // Helper function to compute node value
  function computeNodeValue(nodeId) {
    const { nodes, edges } = useCircuitStore.getState();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    const inputs = edges
      .filter(e => e.target === nodeId)
      .map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        return sourceNode?.data?.value ?? false;
      });
    
    switch (node.data.label) {
      case 'INPUT':
        return node.data.value;
      case 'AND':
        return inputs.length >= 2 ? inputs.every(Boolean) : false;
      case 'OR':
        return inputs.some(Boolean);
      case 'NOT':
        return inputs.length === 1 ? !inputs[0] : false;
      case 'OUTPUT':
        return inputs.length > 0 ? inputs[0] : false;
      default:
        return false;
    }
  }

  return (
    <div
      style={{
        height: isCollapsed ? '56px' : '280px',
        backgroundColor: currentTheme.surface,
        borderTop: `1px solid ${currentTheme.border}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: `0 -4px 16px ${currentTheme.shadow.md}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          height: '56px',
          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 24px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 2px 8px ${currentTheme.primary}40`,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = `linear-gradient(135deg, ${currentTheme.primaryHover}, ${currentTheme.primary})`;
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = `0 4px 16px ${currentTheme.primary}60`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`;
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = `0 2px 8px ${currentTheme.primary}40`;
        }}
      >
        <span style={{ 
          fontSize: '18px', 
          fontWeight: '700',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}>
          {isCollapsed ? 'S' : 'Simulation'}
        </span>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '11px', 
              opacity: 0.9,
              fontWeight: '500',
              letterSpacing: '0.02em',
            }}>
              Press to collapse
            </span>
            <span style={{ fontSize: '16px', opacity: 0.7 }}>»</span>
          </div>
        )}
      </button>

      {/* Tab Content */}
      {!isCollapsed && (
        <>
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              gap: '8px',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  backgroundColor: activeTab === tab.id ? currentTheme.primary : 'transparent',
                  color: activeTab === tab.id ? 'white' : currentTheme.text.secondary,
                  border: `1px solid ${activeTab === tab.id ? currentTheme.primary : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = currentTheme.surfaceHover;
                    e.target.style.borderColor = currentTheme.borderLight;
                    e.target.style.color = currentTheme.text.primary;
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.color = currentTheme.text.secondary;
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {activeTab === tab.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, ${currentTheme.primaryHover}, ${currentTheme.secondary})`,
                      animation: 'pulse 2s infinite',
                    }}
                  />
                )}
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '700',
                  textShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                }}>
                  {tab.icon}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  lineHeight: '1.2',
                  letterSpacing: '0.04em',
                  fontWeight: '500',
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {getTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default PremiumBottomPanel;
