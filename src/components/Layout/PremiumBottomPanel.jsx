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
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        height: isMaximized ? 'calc(100vh - 120px)' : isCollapsed ? '64px' : '380px',
        background: `linear-gradient(180deg, ${currentTheme.surface}, ${currentTheme.surfaceHover}20)`,
        borderTop: `3px solid transparent`,
        borderImage: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary}, ${currentTheme.accent}) 1`,
        borderLeft: `1px solid ${currentTheme.border}30`,
        borderRight: `1px solid ${currentTheme.border}30`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: `0 -8px 32px ${currentTheme.shadow.xl}, inset 0 1px 0 rgba(255,255,255,0.1), 0 0 60px ${currentTheme.primary}10`,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        overflow: 'hidden',
        zIndex: isMaximized ? 1000 : 100,
      }}
    >
      {/* Premium Header */}
      <div
        style={{
          height: '64px',
          background: `linear-gradient(135deg, ${currentTheme.primary}20, ${currentTheme.secondary}20, ${currentTheme.accent}20)`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${currentTheme.border}40`,
        }}
      >
        {/* Animated Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${currentTheme.primary}10, transparent)`,
            animation: 'shimmer 3s infinite',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              boxShadow: `0 4px 16px ${currentTheme.primary}40`,
              border: `2px solid rgba(255,255,255,0.2)`,
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: currentTheme.text.primary, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Premium Console</div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary, letterSpacing: '0.02em' }}>Advanced Circuit Analysis Suite</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              width: '32px',
              height: '32px',
              background: showAdvanced ? `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentHover})` : `${currentTheme.surface}80`,
              border: `2px solid ${showAdvanced ? currentTheme.accent : currentTheme.border}60`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: showAdvanced ? 'white' : currentTheme.text.secondary,
              transition: 'all 0.2s',
              boxShadow: showAdvanced ? `0 2px 8px ${currentTheme.accent}40` : `0 2px 8px ${currentTheme.shadow.sm}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = showAdvanced ? `0 4px 16px ${currentTheme.accent}60` : `0 4px 16px ${currentTheme.shadow.md}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = showAdvanced ? `0 2px 8px ${currentTheme.accent}40` : `0 2px 8px ${currentTheme.shadow.sm}`;
            }}
          >
            ⚙
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              width: '32px',
              height: '32px',
              background: isMaximized ? `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.secondaryHover})` : `${currentTheme.surface}80`,
              border: `2px solid ${isMaximized ? currentTheme.secondary : currentTheme.border}60`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: isMaximized ? 'white' : currentTheme.text.secondary,
              transition: 'all 0.2s',
              boxShadow: isMaximized ? `0 2px 8px ${currentTheme.secondary}40` : `0 2px 8px ${currentTheme.shadow.sm}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = isMaximized ? `0 4px 16px ${currentTheme.secondary}60` : `0 4px 16px ${currentTheme.shadow.md}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = isMaximized ? `0 2px 8px ${currentTheme.secondary}40` : `0 2px 8px ${currentTheme.shadow.sm}`;
            }}
          >
            {isMaximized ? '⛶' : '⛶'}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: '32px',
              height: '32px',
              background: `${currentTheme.surface}80`,
              border: `2px solid ${currentTheme.border}60`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: currentTheme.text.secondary,
              transition: 'all 0.2s',
              boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${currentTheme.primary}20`;
              e.target.style.transform = 'scale(1.1)';
              e.target.style.borderColor = currentTheme.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `${currentTheme.surface}80`;
              e.target.style.transform = 'scale(1)';
              e.target.style.borderColor = `${currentTheme.border}60`;
            }}
          >
            {isCollapsed ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showAdvanced && !isCollapsed && (
        <div
          style={{
            padding: '16px 24px',
            background: `${currentTheme.accent}10`,
            borderBottom: `2px solid ${currentTheme.accent}30`,
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: currentTheme.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Simulation Speed:
            </span>
            <select
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `2px solid ${currentTheme.accent}40`,
                background: currentTheme.surface,
                color: currentTheme.text.primary,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <option>Slow</option>
              <option selected>Normal</option>
              <option>Fast</option>
              <option>Instant</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: currentTheme.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Analysis Mode:
            </span>
            <select
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `2px solid ${currentTheme.accent}40`,
                background: currentTheme.surface,
                color: currentTheme.text.primary,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <option selected>Standard</option>
              <option>Advanced</option>
              <option>Debug</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="auto-run"
              style={{
                width: '16px',
                height: '16px',
                accentColor: currentTheme.accent,
              }}
            />
            <label 
              htmlFor="auto-run"
              style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                color: currentTheme.text.secondary,
                cursor: 'pointer',
              }}
            >
              Auto-run on changes
            </label>
          </div>
        </div>
      )}
      {!isCollapsed && (
        <div
          style={{
            display: 'flex',
            borderBottom: `2px solid ${currentTheme.primary}20`,
            padding: '6px 12px',
            gap: '4px',
            background: `${currentTheme.surface}50`,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                height: '32px',
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : currentTheme.text.secondary,
                border: activeTab === tab.id 
                  ? `2px solid ${currentTheme.primary}60` 
                  : `2px solid ${currentTheme.border}40`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '700',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: activeTab === tab.id 
                  ? `0 2px 8px ${currentTheme.primary}40, inset 0 1px 0 rgba(255,255,255,0.2)`
                  : `0 1px 4px ${currentTheme.shadow.sm}`,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = `${currentTheme.primary}15`;
                  e.target.style.borderColor = currentTheme.primary;
                  e.target.style.color = currentTheme.text.primary;
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 20px ${currentTheme.shadow.md}`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = `${currentTheme.border}40`;
                  e.target.style.color = currentTheme.text.secondary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 2px 8px ${currentTheme.shadow.sm}`;
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
                    height: '3px',
                    background: `linear-gradient(90deg, ${currentTheme.secondary}, ${currentTheme.accent})`,
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
                fontWeight: '600',
                textTransform: 'uppercase',
              }}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {!isCollapsed && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            background: `${currentTheme.background}30`,
          }}
        >
          {/* Main Content */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflow: 'auto',
              animation: 'fadeIn 0.4s ease-out',
            }}
          >
            {getTabContent()}
          </div>
          
          {/* Classical Side Panel */}
          <div
            style={{
              width: '200px',
              background: `${currentTheme.surface}60`,
              borderLeft: `2px solid ${currentTheme.primary}20`,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Circuit Status */}
            <div>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                color: currentTheme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Circuit Status
              </div>
              <div style={{
                background: `${currentTheme.primary}10`,
                border: `2px solid ${currentTheme.primary}30`,
                borderRadius: '12px',
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: currentTheme.primary,
                      textShadow: `0 1px 2px ${currentTheme.primary}30`,
                    }}>
                      {nodes.length}
                    </div>
                    <div style={{ 
                      fontSize: '8px', 
                      color: currentTheme.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>
                      Gates
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: currentTheme.secondary,
                      textShadow: `0 1px 2px ${currentTheme.secondary}30`,
                    }}>
                      {edges.length}
                    </div>
                    <div style={{ 
                      fontSize: '8px', 
                      color: currentTheme.text.secondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>
                      Wires
                    </div>
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  padding: '8px',
                  background: `${currentTheme.success}20`,
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.success}40`,
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: currentTheme.success,
                  }}>
                    {nodes.filter(n => n.data.value).length} Active
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                color: currentTheme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Quick Controls
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={handleRun}
                  style={{
                    width: '100%',
                    height: '32px',
                    background: `linear-gradient(135deg, ${currentTheme.success}, ${currentTheme.successHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 8px ${currentTheme.success}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 16px ${currentTheme.success}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 2px 8px ${currentTheme.success}40`;
                  }}
                >
                  <span>▶</span>
                  <span>Run</span>
                </button>
                <button
                  onClick={handleStep}
                  style={{
                    width: '100%',
                    height: '32px',
                    background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.secondaryHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 8px ${currentTheme.secondary}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 4px 16px ${currentTheme.secondary}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 2px 8px ${currentTheme.secondary}40`;
                  }}
                >
                  <span>⏭</span>
                  <span>Step</span>
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    height: '32px',
                    background: `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentHover})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 8px ${currentTheme.accent}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
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
                  <span>↺</span>
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Performance Indicator */}
            <div>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                color: currentTheme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Performance
              </div>
              <div style={{
                background: `${currentTheme.surface}80`,
                border: `2px solid ${currentTheme.border}40`,
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%',
                  background: currentTheme.success,
                  boxShadow: `0 0 12px ${currentTheme.success}`,
                  margin: '0 auto 8px',
                  animation: 'pulse 2s infinite',
                }} />
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: '600',
                  color: currentTheme.success,
                }}>
                  Optimal
                </div>
                <div style={{ 
                  fontSize: '8px', 
                  color: currentTheme.text.secondary,
                  marginTop: '4px',
                }}>
                  {nodes.length > 10 ? 'Heavy Load' : nodes.length > 5 ? 'Medium Load' : 'Light Load'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBottomPanel;
