import React, { useState, useEffect } from 'react';

import { useTheme } from '../../contexts/ThemeContext';

import useCircuitStore from '../../store/useCircuitStore';

import CircuitTemplates from '../CircuitTemplates';

import AICircuitGenerator from '../AICircuitGenerator';

import AdvancedAICircuitGenerator from '../AdvancedAICircuitGenerator';

import CircuitManager from '../CircuitManager';

import CircuitExport from '../CircuitExport';

import VerilogConverter from '../VerilogConverter';

import ArchitecturalModeler from '../ArchitecturalModeler';

import SimulationEngine from '../SimulationEngine';

import StandardCellLibrary_v2 from '../StandardCellLibrary_v2';

import DRCVerification from '../DRCVerification';

import ACDCPanel from '../ACDCPanel';



const PremiumLeftSidebar = () => {

  const { currentTheme } = useTheme();

  const { clearCircuit } = useCircuitStore();

  const [activeTab, setActiveTab] = useState('templates');

  const [isCollapsed, setIsCollapsed] = useState(true);

  // Listen for Advanced AI tab switch event
  useEffect(() => {
    const handleSwitchToAdvancedAI = () => {
      setActiveTab('advanced-ai');
      setIsCollapsed(false);
    };

    window.addEventListener('switchToAdvancedAI', handleSwitchToAdvancedAI);
    
    return () => {
      window.removeEventListener('switchToAdvancedAI', handleSwitchToAdvancedAI);
    };
  }, [setActiveTab, setIsCollapsed]);



  const tabs = [

    { id: 'templates', label: 'Templates', icon: 'T', description: 'Pre-built circuits' },

    { id: 'ai', label: 'AI', icon: 'AI', description: 'Generate circuits' },

    { id: 'advanced-ai', label: 'Advanced AI', icon: '🧠', description: 'ML-enhanced generation' },

    { id: 'acdc', label: 'AC/DC', icon: '⚡', description: 'AC/DC components' },

    { id: 'files', label: 'Files', icon: 'F', description: 'Save & Load' },

    { id: 'verilog', label: 'Verilog', icon: 'V', description: 'Convert code' },

    { id: 'architectural', label: 'Architectural', icon: 'A', description: 'High-level design' },

    { id: 'simulation', label: 'Simulation', icon: 'S', description: 'Test & verify' },

    { id: 'library', label: 'Library', icon: 'L', description: 'Standard cells' },

    { id: 'verification', label: 'DRC/LVS', icon: 'D', description: 'Design rules' },

    { id: 'export', label: 'Export', icon: 'E', description: 'Export options' },

  ];

  


  const getTabContent = () => {

    switch (activeTab) {

      case 'templates':

        return <CircuitTemplates />;

      case 'ai':

        return <AICircuitGenerator />;

      case 'advanced-ai':

        return <AdvancedAICircuitGenerator />;

      case 'files':

        return <CircuitManager />;

      case 'verilog':

        return <VerilogConverter />;

      case 'architectural':

        return <ArchitecturalModeler />;

      case 'simulation':

        return <SimulationEngine />;

      case 'library':

        return <StandardCellLibrary_v2 />;

      case 'verification':

        return <DRCVerification />;

      case 'export':

        return <CircuitExport />;

      case 'acdc':

        return <ACDCPanel />;

      default:

        return <CircuitTemplates />;

    }

  };



  return (

    <div

      style={{

        height: '100%',

        width: isCollapsed ? '56px' : '400px',

        backgroundColor: currentTheme.surface,

        borderRight: `1px solid ${currentTheme.border}`,

        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

        display: 'flex',

        flexDirection: 'column',

        boxShadow: `2px 0 12px ${currentTheme.shadow.md}`,

        backdropFilter: 'blur(8px)',

        WebkitBackdropFilter: 'blur(8px)',

        position: 'relative',

        zIndex: 1000,

      }}

    >

      {/* Collapse/Expand Toggle */}

      <button

        onClick={() => setIsCollapsed(!isCollapsed)}

        style={{

          width: '100%',

          height: '56px',

          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`,

          color: 'white',

          border: 'none',

          cursor: 'pointer',

          display: 'flex',

          alignItems: 'center',

          justifyContent: isCollapsed ? 'center' : 'space-between',

          padding: isCollapsed ? '0' : '0 16px',

          fontSize: isCollapsed ? '20px' : '14px',

          fontWeight: '600',

          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

          position: 'relative',

          boxShadow: `0 2px 8px ${currentTheme.primary}40`,

        }}

        onMouseEnter={(e) => {

          e.target.style.background = `linear-gradient(135deg, ${currentTheme.primaryHover}, ${currentTheme.primary})`;

          e.target.style.transform = 'translateX(-2px)';

          e.target.style.boxShadow = `0 4px 16px ${currentTheme.primary}60`;

        }}

        onMouseLeave={(e) => {

          e.target.style.background = `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryHover})`;

          e.target.style.transform = 'translateX(0)';

          e.target.style.boxShadow = `0 2px 8px ${currentTheme.primary}40`;

        }}

      >

        <span style={{ 

          marginRight: isCollapsed ? '0' : '12px',

          textShadow: '0 1px 2px rgba(0,0,0,0.3)',

        }}>

          {isCollapsed ? 'T' : 'Tools'}

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

            <span style={{ fontSize: '16px', opacity: 0.7 }}>«</span>

          </div>

        )}

      </button>



      {/* Tab Navigation */}

      {!isCollapsed && (

        <div

          style={{

            display: 'flex',

            borderBottom: `1px solid ${currentTheme.border}`,

            padding: '8px 12px',

            gap: '6px',

          }}

        >

          {tabs.map((tab) => (

            <button

              key={tab.id}

              onClick={() => setActiveTab(tab.id)}

              style={{

                flex: 1,

                padding: '10px 6px',

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

      )}



      {/* Tab Content */}

      {!isCollapsed && (

        <div

          style={{

            flex: 1,

            overflow: 'auto',

            padding: '8px 12px',

            minHeight: 0,

          }}

        >

          <div

            style={{

              marginBottom: '8px',

              paddingBottom: '8px',

              borderBottom: `1px solid ${currentTheme.border}`,

            }}

          >

            <div

              style={{

                fontSize: '12px',

                fontWeight: '600',

                color: currentTheme.text.secondary,

                textTransform: 'uppercase',

                letterSpacing: '0.05em',

                marginBottom: '4px',

              }}

            >

              {tabs.find(t => t.id === activeTab)?.label}

            </div>

            <div

              style={{

                fontSize: '10px',

                color: currentTheme.text.secondary,

                opacity: 0.7,

              }}

            >

              {tabs.find(t => t.id === activeTab)?.description}

            </div>

          </div>

          <div

            style={{

              animation: 'fadeIn 0.3s ease-out',

            }}

          >

            {getTabContent()}

          </div>

        </div>

      )}



      {/* Collapsed State Icons */}

      {isCollapsed && (

        <div

          style={{

            flex: 1,

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            padding: '16px 0',

            gap: '16px',

          }}

        >

          {tabs.map((tab) => (

            <button

              key={tab.id}

              onClick={() => {

                setActiveTab(tab.id);

                setIsCollapsed(false);

              }}

              style={{

                width: '40px',

                height: '40px',

                backgroundColor: activeTab === tab.id ? currentTheme.primary : 'transparent',

                color: activeTab === tab.id ? 'white' : currentTheme.text.secondary,

                border: `1px solid ${activeTab === tab.id ? currentTheme.primary : currentTheme.border}`,

                borderRadius: '8px',

                cursor: 'pointer',

                fontSize: '14px',

                fontWeight: '600',

                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

              }}

              onMouseEnter={(e) => {

                if (activeTab !== tab.id) {

                  e.target.style.backgroundColor = `${currentTheme.primary}15`;

                }

              }}

              onMouseLeave={(e) => {

                if (activeTab !== tab.id) {

                  e.target.style.backgroundColor = 'transparent';

                }

              }}

            >

              {tab.icon}

            </button>

          ))}

        </div>

      )}



      {/* Clear Button */}

      {!isCollapsed && (

        <div

          style={{

            padding: '20px',

            borderTop: `1px solid ${currentTheme.border}`,

            marginTop: 'auto',

          }}

        >

          <button

            onClick={clearCircuit}

            style={{

              width: '100%',

              padding: '12px',

              backgroundColor: currentTheme.error,

              color: 'white',

              border: 'none',

              borderRadius: '8px',

              cursor: 'pointer',

              fontSize: '13px',

              fontWeight: '600',

              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

              boxShadow: `0 2px 8px ${currentTheme.error}30`,

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '8px',

            }}

            onMouseEnter={(e) => {

              e.target.style.backgroundColor = '#dc2626';

              e.target.style.transform = 'translateY(-1px)';

              e.target.style.boxShadow = `0 4px 12px ${currentTheme.error}40`;

            }}

            onMouseLeave={(e) => {

              e.target.style.backgroundColor = currentTheme.error;

              e.target.style.transform = 'translateY(0)';

              e.target.style.boxShadow = `0 2px 8px ${currentTheme.error}30`;

            }}

          >

            <span style={{ fontSize: '14px' }}>×</span>

            <span>Clear Canvas</span>

          </button>

        </div>

      )}

    </div>

  );

};



export default PremiumLeftSidebar;

