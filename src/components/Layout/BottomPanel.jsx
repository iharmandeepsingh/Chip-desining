import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import TruthTable from '../TruthTable';
import useTimingSimulation from '../../hooks/useTimingSimulation';

const BottomPanel = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, propagateValues } = useCircuitStore();
  const { 
    isTimingMode, 
    isPaused, 
    simulationSpeed, 
    startTimingSimulation, 
    stopTimingSimulation, 
    pauseTimingSimulation,
    updateSimulationSpeed,
    getTimingStatistics 
  } = useTimingSimulation();
  const [activeTab, setActiveTab] = useState('simulation');

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: '⚡' },
    { id: 'truth-table', label: 'Truth Table', icon: '📊' },
    { id: 'timing', label: 'Timing Analysis', icon: '⏱️' },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'simulation':
        return <SimulationTab />;
      case 'truth-table':
        return <TruthTable />;
      case 'timing':
        return <TimingTab stats={getTimingStatistics()} />;
      default:
        return <SimulationTab />;
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
              padding: '10px 8px',
              backgroundColor: activeTab === tab.id ? currentTheme.primary : 'transparent',
              color: activeTab === tab.id ? 'white' : currentTheme.text.secondary,
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === tab.id ? `2px solid ${currentTheme.primary}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
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
            <div style={{ fontSize: '14px' }}>{tab.icon}</div>
            <div style={{ fontSize: '10px', lineHeight: '1.2' }}>{tab.label}</div>
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
    </div>
  );
};

// Simulation Tab Component
const SimulationTab = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, propagateValues } = useCircuitStore();

  const handleRun = () => {
    propagateValues();
  };

  const handleStep = () => {
    // Step-by-step simulation logic here
    const nodeOrder = topologicalSort(nodes, []);
    nodeOrder.forEach((nodeId, index) => {
      setTimeout(() => {
        // Step logic for each node
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          // Update node value based on inputs
          // This would integrate with the timing simulation
        }
      }, index * 600);
    });
  };

  const handleReset = () => {
    setNodes(nodes.map(node => 
      node.data.label === 'INPUT' 
        ? { ...node, data: { ...node.data, value: false } }
        : node
    ));
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <SimulationButton
          label="Run"
          icon="▶️"
          color={currentTheme.success}
          onClick={handleRun}
        />
        <SimulationButton
          label="Step"
          icon="⏭️"
          color={currentTheme.secondary}
          onClick={handleStep}
        />
        <SimulationButton
          label="Reset"
          icon="🔄"
          color={currentTheme.accent}
          onClick={handleReset}
        />
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
};

// Timing Tab Component
const TimingTab = ({ stats }) => {
  const { currentTheme } = useTheme();

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: currentTheme.text.primary,
          marginBottom: '12px',
        }}
      >
        Timing Analysis
      </div>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <TimingStatCard
          label="Total Nodes"
          value={stats.totalNodes}
          color={currentTheme.primary}
          theme={currentTheme}
        />
        <TimingStatCard
          label="Sequential Nodes"
          value={stats.sequentialNodes}
          color={currentTheme.secondary}
          theme={currentTheme}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <TimingStatCard
          label="Total Delay"
          value={`${stats.totalDelay}ms`}
          color={currentTheme.accent}
          theme={currentTheme}
        />
        <TimingStatCard
          label="Avg Delay"
          value={`${Math.round(stats.averageDelay)}ms`}
          color={currentTheme.success}
          theme={currentTheme}
        />
        <TimingStatCard
          label="Critical Path"
          value={`${stats.criticalPathDelay}ms`}
          color={currentTheme.error}
          theme={currentTheme}
        />
      </div>

      {stats.criticalPath && (
        <div
          style={{
            backgroundColor: `${currentTheme.error}10`,
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${currentTheme.error}`,
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: currentTheme.error,
              marginBottom: '8px',
            }}
          >
            ⚠️ Critical Path Detected
          </div>
          <div
            style={{
              fontSize: '10px',
              color: currentTheme.text.secondary,
              lineHeight: '1.4',
            }}
          >
            Longest signal path: {stats.criticalPathDelay}ms
            <br />
            Consider optimizing this path for better performance
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SimulationButton = ({ label, icon, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      padding: '12px',
      backgroundColor: color,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 2px 8px ${color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px) scale(1.05)';
      e.target.style.boxShadow = `0 4px 12px ${color}60`;
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0) scale(1)';
      e.target.style.boxShadow = `0 2px 8px ${color}40`;
    }}
    onMouseDown={(e) => {
      e.target.style.transform = 'translateY(0) scale(0.95)';
    }}
    onMouseUp={(e) => {
      e.target.style.transform = 'translateY(0) scale(1)';
    }}
  >
    <span style={{ fontSize: '14px' }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const TimingStatCard = ({ label, value, color, theme }) => (
  <div
    style={{
      backgroundColor: `${color}10`,
      borderRadius: '8px',
      padding: '12px',
      border: `1px solid ${color}`,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        fontSize: '10px',
        color: theme.text.secondary,
        marginBottom: '4px',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: color,
      }}
    >
      {value}
    </div>
  </div>
);

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
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
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

export default BottomPanel;
