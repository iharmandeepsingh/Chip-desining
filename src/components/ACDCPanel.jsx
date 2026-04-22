import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ACDCComponents, detectSignalType, checkCompatibility, getRequiredConverter } from './ACDCComponents.jsx';

const ACDCPanel = ({ onAddComponent }) => {
  const { currentTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('power');
  const [signalMode, setSignalMode] = useState('mixed');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentProperties, setComponentProperties] = useState({});

  const categories = {
    power: { label: 'Power Components', icon: '⚡' },
    logic: { label: 'Logic Gates', icon: '🔧' },
    sequential: { label: 'Sequential Logic', icon: '⏱️' },
    converter: { label: 'Signal Converters', icon: '🔄' },
    analog: { label: 'Analog Components', icon: '📊' },
    actuator: { label: 'Actuators', icon: '⚙️' }
  };

  const getComponentsByCategory = (category) => {
    return Object.values(ACDCComponents).filter(
      comp => comp.category === category
    );
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setComponentProperties({ ...component.defaultData });
  };

  const handlePropertyChange = (property, value) => {
    setComponentProperties(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleAddComponent = () => {
    if (selectedComponent) {
      const component = {
        id: `${selectedComponent.type}_${Date.now()}`,
        type: selectedComponent.type,
        label: selectedComponent.label,
        data: {
          ...componentProperties,
          signalType: componentProperties.signalType || detectSignalType(selectedComponent.type)
        },
        position: { x: 100, y: 100 }
      };
      
      onAddComponent(component);
      setSelectedComponent(null);
      setComponentProperties({});
    }
  };

  const getSignalCompatibility = (sourceType, targetType) => {
    const compatibility = checkCompatibility(sourceType, targetType);
    let status, color, message;
    
    switch (compatibility) {
      case true:
        status = '✅ Compatible';
        color = '#10b981';
        message = 'Direct connection possible';
        break;
      case 'needs_rectifier':
        status = '⚠️ Needs Rectifier';
        color = '#f59e0b';
        message = 'AC to DC conversion required';
        break;
      case 'needs_inverter':
        status = '⚠️ Needs Inverter';
        color = '#f59e0b';
        message = 'DC to AC conversion required';
        break;
      default:
        status = '❌ Incompatible';
        color = '#ef4444';
        message = 'Connection not possible';
    }
    
    return { status, color, message };
  };

  return (
    <div style={{
      padding: '20px',
      background: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '8px',
      color: currentTheme.textPrimary,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: currentTheme.textPrimary }}>
        🔌 AC/DC Circuit Components
      </h3>
      
      {/* Signal Mode Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Signal Mode:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['ac', 'dc', 'mixed'].map(mode => (
            <button
              key={mode}
              onClick={() => setSignalMode(mode)}
              style={{
                padding: '8px 16px',
                background: signalMode === mode ? currentTheme.primary : currentTheme.surface,
                color: signalMode === mode ? 'white' : currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {mode === 'ac' && '⚡ AC'}
              {mode === 'dc' && '🔋 DC'}
              {mode === 'mixed' && '🔄 Mixed'}
            </button>
          ))}
        </div>
      </div>

      {/* Component Categories */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Component Category:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '12px',
                background: selectedCategory === key ? currentTheme.primary : currentTheme.surface,
                color: selectedCategory === key ? 'white' : currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '12px'
              }}
            >
              <div>{category.icon}</div>
              <div>{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: currentTheme.textSecondary }}>
          {categories[selectedCategory]?.label}:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {getComponentsByCategory(selectedCategory).map((component, index) => (
            <div
              key={index}
              onClick={() => handleComponentSelect(component)}
              style={{
                padding: '12px',
                background: selectedComponent?.type === component.type 
                  ? currentTheme.primary 
                  : currentTheme.surface,
                color: selectedComponent?.type === component.type 
                  ? 'white' 
                  : currentTheme.textPrimary,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {component.label}
              </div>
              <div style={{ fontSize: '9px', color: currentTheme.textSecondary }}>
                Type: {component.signalType}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component Properties */}
      {selectedComponent && (
        <div style={{
          padding: '16px',
          background: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '6px',
          marginTop: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: currentTheme.textPrimary }}>
            ⚙️ {selectedComponent.label} Properties
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Common Properties */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                Signal Type:
              </label>
              <select
                value={componentProperties.signalType || selectedComponent.signalType}
                onChange={(e) => handlePropertyChange('signalType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  background: currentTheme.surface,
                  color: currentTheme.textPrimary,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px'
                }}
              >
                <option value="AC">AC</option>
                <option value="DC">DC</option>
                <option value="MIXED">MIXED</option>
              </select>
            </div>

            {/* AC Properties */}
            {(componentProperties.signalType === 'AC' || selectedComponent.signalType === 'AC') && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                    Frequency (Hz):
                  </label>
                  <input
                    type="number"
                    value={componentProperties.frequency || 50}
                    onChange={(e) => handlePropertyChange('frequency', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: currentTheme.surface,
                      color: currentTheme.textPrimary,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                    Amplitude (V):
                  </label>
                  <input
                    type="number"
                    value={componentProperties.amplitude || 5}
                    onChange={(e) => handlePropertyChange('amplitude', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: currentTheme.surface,
                      color: currentTheme.textPrimary,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                    Phase (degrees):
                  </label>
                  <input
                    type="number"
                    value={componentProperties.phase || 0}
                    onChange={(e) => handlePropertyChange('phase', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: currentTheme.surface,
                      color: currentTheme.textPrimary,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </>
            )}

            {/* DC Properties */}
            {(componentProperties.signalType === 'DC' || selectedComponent.signalType === 'DC') && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                  Voltage (V):
                </label>
                <input
                  type="number"
                  value={componentProperties.voltage || 5}
                  onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px',
                    background: currentTheme.surface,
                    color: currentTheme.textPrimary,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}

            {/* Component-specific properties */}
            {selectedComponent.defaultData.voltage !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                  Voltage (V):
                </label>
                <input
                  type="number"
                  value={componentProperties.voltage || selectedComponent.defaultData.voltage}
                  onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px',
                    background: currentTheme.surface,
                    color: currentTheme.textPrimary,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleAddComponent}
            style={{
              width: '100%',
              padding: '12px',
              background: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '16px'
            }}
          >
            ➕ Add Component
          </button>
        </div>
      )}

      {/* Compatibility Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: currentTheme.background,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '6px',
        fontSize: '11px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: currentTheme.textPrimary }}>
          🔗 Signal Compatibility Guide
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ color: '#10b981' }}>✅ AC → AC: Direct</div>
          <div style={{ color: '#10b981' }}>✅ DC → DC: Direct</div>
          <div style={{ color: '#f59e0b' }}>⚠️ AC → DC: Needs Rectifier</div>
          <div style={{ color: '#f59e0b' }}>⚠️ DC → AC: Needs Inverter</div>
          <div style={{ color: '#10b981' }}>✅ Mixed: Compatible with both</div>
        </div>
      </div>
    </div>
  );
};

export default ACDCPanel;
