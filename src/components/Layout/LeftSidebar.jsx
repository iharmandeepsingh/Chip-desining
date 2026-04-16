import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import CircuitTemplates from '../CircuitTemplates';
import AICircuitGenerator from '../AICircuitGenerator';
import CircuitManager from '../CircuitManager';
import CircuitExport from '../CircuitExport';

const LeftSidebar = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, clearCircuit } = useCircuitStore();
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'ai', label: 'AI Generator', icon: '🤖' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'export', label: 'Export', icon: '📥' },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return <CircuitTemplates />;
      case 'ai':
        return <AICircuitGenerator />;
      case 'files':
        return <CircuitManager />;
      case 'export':
        return <CircuitExport />;
      default:
        return <CircuitTemplates />;
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
          Tools & Resources
        </div>
        <div
          style={{
            fontSize: '11px',
            color: currentTheme.text.secondary,
          }}
        >
          {nodes.length} nodes, {edges.length} connections
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
            <div style={{ fontSize: '16px' }}>{tab.icon}</div>
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

      {/* Quick Actions */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${currentTheme.border}`,
          backgroundColor: `${currentTheme.background}50`,
        }}
      >
        <button
          onClick={clearCircuit}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: currentTheme.error,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dc2626';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = currentTheme.error;
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🗑️ Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
