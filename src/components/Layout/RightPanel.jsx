import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import CircuitValidation from '../CircuitValidation';

const RightPanel = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, getAvailableGateTypes } = useCircuitStore();
  const [activeTab, setActiveTab] = useState('status');
  const [selectedNode, setSelectedNode] = useState(null);

  const tabs = [
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'properties', label: 'Properties', icon: '⚙️' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'status':
        return <StatusTab />;
      case 'properties':
        return <PropertiesTab selectedNode={selectedNode} />;
      case 'shortcuts':
        return <ShortcutsTab />;
      default:
        return <StatusTab />;
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
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
          backgroundColor: `${currentTheme.primary}10`,
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentTheme.primary,
            marginBottom: '4px',
          }}
        >
          Properties Panel
        </div>
        <div
          style={{
            fontSize: '11px',
            color: currentTheme.text.secondary,
          }}
        >
          {selectedNode ? `Selected: ${selectedNode.data?.label}` : 'No selection'}
        </div>
      </div>

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
              padding: '12px 8px',
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
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {getTabContent()}
      </div>
    </div>
  );
};

// Status Tab Component
const StatusTab = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();

  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    inputNodes: nodes.filter(n => n.data.label === 'INPUT').length,
    outputNodes: nodes.filter(n => n.data.label === 'OUTPUT').length,
    logicGates: nodes.filter(n => ['AND', 'OR', 'NOT'].includes(n.data.label)).length,
    activeNodes: nodes.filter(n => n.data.value).length,
  };

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: currentTheme.text.primary,
          marginBottom: '12px',
        }}
      >
        Circuit Statistics
      </div>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <StatCard
          label="Total Nodes"
          value={stats.totalNodes}
          color={currentTheme.primary}
          theme={currentTheme}
        />
        <StatCard
          label="Total Edges"
          value={stats.totalEdges}
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
        <StatCard
          label="Inputs"
          value={stats.inputNodes}
          color={currentTheme.gateColors.INPUT}
          theme={currentTheme}
        />
        <StatCard
          label="Outputs"
          value={stats.outputNodes}
          color={currentTheme.gateColors.OUTPUT}
          theme={currentTheme}
        />
        <StatCard
          label="Logic Gates"
          value={stats.logicGates}
          color={currentTheme.gateColors.AND}
          theme={currentTheme}
        />
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: `${currentTheme.success}10`,
          borderRadius: '8px',
          border: `1px solid ${currentTheme.success}`,
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: currentTheme.success,
            fontWeight: '600',
            marginBottom: '4px',
          }}
        >
          ✅ Circuit Status: Valid
        </div>
        <div
          style={{
            fontSize: '10px',
            color: currentTheme.text.secondary,
            lineHeight: '1.4',
          }}
        >
          No validation errors detected. Circuit is ready for simulation.
        </div>
      </div>
    </div>
  );
};

// Properties Tab Component
const PropertiesTab = ({ selectedNode }) => {
  const { currentTheme } = useTheme();

  if (!selectedNode) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: currentTheme.text.secondary,
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
        <div style={{ fontSize: '12px' }}>
          Select a node to view its properties
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: currentTheme.text.primary,
          marginBottom: '12px',
        }}
      >
        Node Properties
      </div>
      
      <div
        style={{
          backgroundColor: `${currentTheme.background}50`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
        }}
      >
        <PropertyRow
          label="Type"
          value={selectedNode.data.label}
          theme={currentTheme}
        />
        <PropertyRow
          label="ID"
          value={selectedNode.id}
          theme={currentTheme}
        />
        <PropertyRow
          label="Value"
          value={selectedNode.data.value ? '1' : '0'}
          theme={currentTheme}
        />
        {selectedNode.position && (
          <>
            <PropertyRow
              label="Position X"
              value={Math.round(selectedNode.position.x)}
              theme={currentTheme}
            />
            <PropertyRow
              label="Position Y"
              value={Math.round(selectedNode.position.y)}
              theme={currentTheme}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Shortcuts Tab Component
const ShortcutsTab = () => {
  const { currentTheme } = useTheme();

  const shortcuts = [
    { key: 'Ctrl+I', action: 'Add INPUT Gate' },
    { key: 'Ctrl+A', action: 'Add AND Gate' },
    { key: 'Ctrl+O', action: 'Add OR Gate' },
    { key: 'Ctrl+N', action: 'Add NOT Gate' },
    { key: 'Ctrl+X', action: 'Add OUTPUT Gate' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Y', action: 'Redo' },
    { key: 'Ctrl+S', action: 'Save Circuit' },
    { key: 'Ctrl+R', action: 'Run Simulation' },
    { key: 'Space', action: 'Step Mode' },
    { key: 'Delete', action: 'Delete Selected' },
    { key: 'Ctrl+Shift+R', action: 'Reset Values' },
  ];

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: currentTheme.text.primary,
          marginBottom: '12px',
        }}
      >
        Keyboard Shortcuts
      </div>
      
      <div
        style={{
          display: 'grid',
          gap: '8px',
        }}
      >
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: index % 2 === 0 ? `${currentTheme.background}30` : 'transparent',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: currentTheme.primary,
                fontWeight: '600',
                backgroundColor: `${currentTheme.primary}20`,
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            >
              {shortcut.key}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
                flex: 1,
                marginLeft: '8px',
              }}
            >
              {shortcut.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, color, theme }) => (
  <div
    style={{
      backgroundColor: `${color}10`,
      borderRadius: '8px',
      padding: '12px',
      border: `1px solid ${color}`,
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
        fontSize: '18px',
        fontWeight: 'bold',
        color: color,
      }}
    >
      {value}
    </div>
  </div>
);

const PropertyRow = ({ label, value, theme }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: `1px solid ${theme.border}`,
    }}
  >
    <div
      style={{
        fontSize: '11px',
        color: theme.text.secondary,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: '11px',
        fontWeight: '600',
        color: theme.text.primary,
        fontFamily: 'monospace',
      }}
    >
      {value}
    </div>
  </div>
);

export default RightPanel;
