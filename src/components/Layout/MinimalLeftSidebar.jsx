import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';
import CircuitTemplates from '../CircuitTemplates';
import AICircuitGenerator from '../AICircuitGenerator';
import CircuitManager from '../CircuitManager';
import CircuitExport from '../CircuitExport';

const MinimalLeftSidebar = () => {
  const { currentTheme } = useTheme();
  const { clearCircuit } = useCircuitStore();
  const [activeTab, setActiveTab] = useState('templates');
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        width: isCollapsed ? '60px' : '280px',
        backgroundColor: currentTheme.surface,
        borderRight: `1px solid ${currentTheme.border}`,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          width: '100%',
          height: '40px',
          backgroundColor: currentTheme.primary,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          padding: isCollapsed ? '0' : '0 16px',
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
        {isCollapsed ? '📋' : '⋮'}
        {!isCollapsed && (
          <span style={{ marginLeft: '8px', fontSize: '11px' }}>
            Tools
          </span>
        )}
      </button>

      {/* Tab Navigation */}
      {!isCollapsed && (
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
              <span style={{ fontSize: '10px' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {!isCollapsed && (
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '16px',
          }}
        >
          {getTabContent()}
        </div>
      )}

      {/* Clear Button */}
      {!isCollapsed && (
        <div
          style={{
            padding: '16px',
            borderTop: `1px solid ${currentTheme.border}`,
            marginTop: 'auto',
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
      )}
    </div>
  );
};

export default MinimalLeftSidebar;
