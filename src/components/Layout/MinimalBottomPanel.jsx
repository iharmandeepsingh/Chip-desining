import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import TruthTable from '../TruthTable';

const MinimalBottomPanel = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, propagateValues } = useCircuitStore();
  const [activeTab, setActiveTab] = useState('simulation');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: '⚡' },
    { id: 'truth-table', label: 'Truth Table', icon: '📊' },
  ];

  const handleRun = () => {
    propagateValues();
  };

  const handleStep = () => {
    // Step-by-step simulation logic here
    const nodeOrder = topologicalSort(nodes, edges);
    nodeOrder.forEach((nodeId, index) => {
      setTimeout(() => {
        // Step logic for each node
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          // Update node value based on inputs
          // This would integrate with timing simulation
        }
      }, index * 300);
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
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <button
                onClick={handleRun}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: currentTheme.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 2px 8px ${currentTheme.success}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = `0 4px 12px ${currentTheme.success}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 2px 8px ${currentTheme.success}40`;
                }}
              >
                <span style={{ fontSize: '16px' }}>▶</span>
                <span>Run</span>
              </button>

              <button
                onClick={handleStep}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: currentTheme.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 2px 8px ${currentTheme.secondary}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = `0 4px 12px ${currentTheme.secondary}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 2px 8px ${currentTheme.secondary}40`;
                }}
              >
                <span style={{ fontSize: '16px' }}>⏭️</span>
                <span>Step</span>
              </button>

              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: currentTheme.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 2px 8px ${currentTheme.accent}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = `0 4px 12px ${currentTheme.accent}60`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 2px 8px ${currentTheme.accent}40`;
                }}
              >
                <span style={{ fontSize: '16px' }}>🔄</span>
                <span>Reset</span>
              </button>
            </div>

            <div
              style={{
                backgroundColor: `${currentTheme.background}50`,
                borderRadius: '8px',
                padding: '12px',
                border: `1px solid ${currentTheme.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.text.primary,
                  marginBottom: '8px',
                }}
              >
                Simulation Status
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>Nodes</div>
                  <div>{nodes.length}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>Connections</div>
                  <div>{edges.length}</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>Active</div>
                  <div>{nodes.filter(n => n.data.value).length}</div>
                </div>
              </div>
            </div>
          </div>
        );
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
    
    nodes.forEach(node => {
      graph[node.id] = [];
      inDegree[node.id] = 0;
    });
    
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    });
    
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

  return (
    <div
      style={{
        height: isCollapsed ? '48px' : '200px',
        backgroundColor: currentTheme.surface,
        borderTop: `1px solid ${currentTheme.border}`,
        transition: 'height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          height: '48px',
          backgroundColor: currentTheme.primary,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: isCollapsed ? '16px' : '12px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = `${currentTheme.primary}dd`;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = currentTheme.primary;
        }}
      >
        <span>{isCollapsed ? '⚡' : '⚡'}</span>
        <span>{isCollapsed ? 'Controls' : 'Simulation'}</span>
      </button>

      {/* Tab Content */}
      {!isCollapsed && (
        <>
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: `1px solid ${currentTheme.border}`,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: activeTab === tab.id ? currentTheme.primary : 'transparent',
                  color: activeTab === tab.id ? 'white' : currentTheme.text.secondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = `${currentTheme.primary}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              padding: '16px',
            }}
          >
            {getTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default MinimalBottomPanel;
