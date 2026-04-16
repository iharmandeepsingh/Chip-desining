import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedComponentLibrary = () => {
  const { currentTheme } = useTheme();
  const { addNode } = useCircuitStore();
  const [activeCategory, setActiveCategory] = useState('basic');
  const [showCustomGate, setShowCustomGate] = useState(false);

  const categories = [
    {
      id: 'basic',
      name: 'Basic Gates',
      icon: '🔧',
      components: [
        { type: 'INPUT', label: 'Input', description: 'Binary input signal' },
        { type: 'OUTPUT', label: 'Output', description: 'Binary output signal' },
        { type: 'AND', label: 'AND', description: 'Logical AND operation' },
        { type: 'OR', label: 'OR', description: 'Logical OR operation' },
        { type: 'NOT', label: 'NOT', description: 'Logical NOT operation' },
      ]
    },
    {
      id: 'arithmetic',
      name: 'Arithmetic',
      icon: '🧮',
      components: [
        { type: 'XOR', label: 'XOR', description: 'Exclusive OR operation' },
        { type: 'XNOR', label: 'XNOR', description: 'Exclusive NOR operation' },
        { type: 'NAND', label: 'NAND', description: 'NOT AND operation' },
        { type: 'NOR', label: 'NOR', description: 'NOT OR operation' },
      ]
    },
    {
      id: 'sequential',
      name: 'Sequential',
      icon: '⏱️',
      components: [
        { type: 'D_FLIP_FLOP', label: 'D Flip-Flop', description: 'Data storage with clock' },
        { type: 'JK_FLIP_FLOP', label: 'JK Flip-Flop', description: 'JK flip-flop with set/reset' },
        { type: 'CLOCK', label: 'Clock', description: 'Clock signal generator' },
        { type: 'COUNTER', label: 'Counter', description: 'Binary counter' },
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced',
      icon: '⚡',
      components: [
        { type: 'MULTIPLEXER', label: 'Multiplexer', description: 'Data selector circuit' },
        { type: 'DECODER', label: 'Decoder', description: 'Binary decoder circuit' },
        { type: 'ALU', label: 'ALU', description: 'Arithmetic Logic Unit' },
        { type: 'REGISTER', label: 'Register', description: 'Data register' },
      ]
    }
  ];

  const handleAddComponent = (component) => {
    const newNode = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'gate',
      position: {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 150,
      },
      data: {
        label: component.type,
        value: component.type === 'INPUT' ? false : false,
        description: component.description,
      },
    };
    addNode(newNode);
  };

  const handleCreateCustomGate = (gateData) => {
    const customNode = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'gate',
      position: {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 150,
      },
      data: {
        label: gateData.name,
        value: false,
        customGate: true,
        inputs: gateData.inputs || [],
        outputs: gateData.outputs || [],
        truthTable: gateData.truthTable || [],
        description: gateData.description,
      },
    };
    addNode(customNode);
    setShowCustomGate(false);
  };

  const renderComponentButton = (component) => (
    <button
      key={component.type}
      onClick={() => handleAddComponent(component)}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: currentTheme.surface,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        color: currentTheme.text.primary,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = `${currentTheme.primary}15`;
        e.target.style.transform = 'translateY(-1px)';
        e.target.style.boxShadow = `0 4px 12px ${currentTheme.primary}30`;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = currentTheme.surface;
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: currentTheme.gateColors[component.type] || currentTheme.primary,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: 'white',
        }}
      >
        {component.type.substring(0, 2)}
      </div>
      <div
        style={{
          flex: 1,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '2px',
          }}
        >
          {component.label}
        </div>
        <div
          style={{
            fontSize: '10px',
            color: currentTheme.text.secondary,
            lineHeight: '1.3',
          }}
        >
          {component.description}
        </div>
      </div>
    </button>
  );

  const renderCustomGateForm = () => (
    <div
      style={{
        backgroundColor: currentTheme.surface,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: `0 4px 16px ${currentTheme.shadow}`,
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: currentTheme.text.primary,
          marginBottom: '16px',
        }}
      >
        Create Custom Gate
      </div>
      
      <div
        style={{
          marginBottom: '16px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Gate Name
        </label>
        <input
          type="text"
          placeholder="My Custom Gate"
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: currentTheme.text.primary,
          }}
        />
      </div>

      <div
        style={{
          marginBottom: '16px',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Description
        </label>
        <textarea
          placeholder="Describe your custom gate..."
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: currentTheme.text.primary,
            resize: 'vertical',
            fontFamily: 'monospace',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          Create Gate
        </button>
        <button
          onClick={() => setShowCustomGate(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: currentTheme.text.secondary,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: currentTheme.background,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: currentTheme.text.primary,
            }}
          >
            Component Library
          </div>
          <button
            onClick={() => setShowCustomGate(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            + Custom Gate
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeCategory === category.id ? currentTheme.primary : 'transparent',
                color: activeCategory === category.id ? 'white' : currentTheme.text.secondary,
                border: `1px solid ${activeCategory === category.id ? currentTheme.primary : currentTheme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {showCustomGate ? (
          renderCustomGateForm()
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            {categories.find(c => c.id === activeCategory)?.components.map(renderComponentButton)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedComponentLibrary;
