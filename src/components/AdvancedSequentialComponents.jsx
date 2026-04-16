import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedSequentialComponents = () => {
  const { currentTheme } = useTheme();
  const { addNode } = useCircuitStore();
  const [activeCategory, setActiveCategory] = useState('flipflops');

  const sequentialComponents = {
    flipflops: [
      {
        type: 'T_FLIP_FLOP',
        label: 'T Flip-Flop',
        description: 'Toggle flip-flop with T input',
        inputs: ['T', 'CLK'],
        outputs: ['Q', 'Q\''],
        truthTable: [
          { T: 0, CLK: '↑', Q: 'Q_prev', Q_: '!Q_prev' },
          { T: 1, CLK: '↑', Q: '!Q_prev', Q_: 'Q_prev' },
        ],
        setupTime: 2,
        holdTime: 1,
        propagationDelay: 8,
      },
      {
        type: 'SR_FLIP_FLOP',
        label: 'SR Flip-Flop',
        description: 'Set-Reset flip-flop with async control',
        inputs: ['S', 'R', 'CLK'],
        outputs: ['Q', 'Q\''],
        truthTable: [
          { S: 0, R: 0, CLK: '↑', Q: 'Q_prev', Q_: '!Q_prev' },
          { S: 0, R: 1, CLK: '↑', Q: 0, Q_: 1 },
          { S: 1, R: 0, CLK: '↑', Q: 1, Q_: 0 },
          { S: 1, R: 1, CLK: '↑', Q: 'X', Q_: 'X' }, // Invalid state
        ],
        setupTime: 2,
        holdTime: 1,
        propagationDelay: 6,
      },
      {
        type: 'JK_FLIP_FLOP_EN',
        label: 'JK Flip-Flop (Enable)',
        description: 'JK flip-flop with enable input',
        inputs: ['J', 'K', 'CLK', 'EN'],
        outputs: ['Q', 'Q\''],
        truthTable: [
          { J: 0, K: 0, CLK: '↑', EN: 1, Q: 'Q_prev', Q_: '!Q_prev' },
          { J: 0, K: 1, CLK: '↑', EN: 1, Q: 0, Q_: 1 },
          { J: 1, K: 0, CLK: '↑', EN: 1, Q: 1, Q_: 0 },
          { J: 1, K: 1, CLK: '↑', EN: 1, Q: '!Q_prev', Q_: 'Q_prev' },
        ],
        setupTime: 3,
        holdTime: 1,
        propagationDelay: 10,
      },
    ],
    memory: [
      {
        type: 'RAM_8BIT',
        label: '8-bit RAM',
        description: '8-bit addressable memory',
        inputs: ['ADDR[7:0]', 'DATA_IN[7:0]', 'WE', 'CLK'],
        outputs: ['DATA_OUT[7:0]'],
        memorySize: 256,
        dataWidth: 8,
        accessTime: 15,
        setupTime: 2,
        holdTime: 1,
      },
      {
        type: 'ROM_16BIT',
        label: '16-bit ROM',
        description: '16-bit read-only memory',
        inputs: ['ADDR[15:0]', 'OE'],
        outputs: ['DATA_OUT[15:0]'],
        memorySize: 65536,
        dataWidth: 16,
        accessTime: 12,
      },
      {
        type: 'REGISTER_8BIT',
        label: '8-bit Register',
        description: '8-bit parallel register',
        inputs: ['DATA_IN[7:0]', 'CLK', 'CLR'],
        outputs: ['DATA_OUT[7:0]'],
        setupTime: 2,
        holdTime: 1,
        propagationDelay: 4,
      },
    ],
    counters: [
      {
        type: 'COUNTER_4BIT_SYNC',
        label: '4-bit Synchronous Counter',
        description: '4-bit synchronous up/down counter',
        inputs: ['CLK', 'UP/DN', 'CLR', 'LOAD'],
        outputs: ['Q[3:0]', 'RCO'],
        maxValue: 15,
        direction: 'bidirectional',
        propagationDelay: 12,
      },
      {
        type: 'COUNTER_8BIT',
        label: '8-bit Counter',
        description: '8-bit up counter with load',
        inputs: ['CLK', 'CLR', 'LOAD', 'DATA_IN[7:0]'],
        outputs: ['Q[7:0]', 'RCO'],
        maxValue: 255,
        direction: 'up',
        propagationDelay: 15,
      },
      {
        type: 'SHIFT_REGISTER_4BIT',
        label: '4-bit Shift Register',
        description: '4-bit serial-in parallel-out shift register',
        inputs: ['SER_IN', 'CLK', 'CLR', 'SHIFT/LOAD'],
        outputs: ['Q[3:0]'],
        shiftDirection: 'right',
        propagationDelay: 8,
      },
    ],
    statemachines: [
      {
        type: 'STATE_MACHINE_2BIT',
        label: '2-bit State Machine',
        description: 'Generic 2-bit state machine',
        inputs: ['X', 'CLK', 'RESET'],
        outputs: ['Y', 'STATE[1:0]'],
        states: ['S0', 'S1', 'S2', 'S3'],
        stateTransitions: [
          { from: 'S0', input: 0, to: 'S0', output: 0 },
          { from: 'S0', input: 1, to: 'S1', output: 0 },
          { from: 'S1', input: 0, to: 'S2', output: 1 },
          { from: 'S1', input: 1, to: 'S3', output: 1 },
          { from: 'S2', input: 0, to: 'S0', output: 0 },
          { from: 'S2', input: 1, to: 'S1', output: 1 },
          { from: 'S3', input: 0, to: 'S3', output: 1 },
          { from: 'S3', input: 1, to: 'S2', output: 0 },
        ],
        propagationDelay: 10,
      },
    ],
  };

  const handleAddComponent = (component) => {
    const newNode = {
      id: `${component.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'sequential',
      position: {
        x: 400 + Math.random() * 200,
        y: 200 + Math.random() * 150,
      },
      data: {
        label: component.type,
        value: false,
        ...component,
        // Sequential-specific properties
        currentState: 0,
        previousState: 0,
        clockEdge: 'rising',
        memory: component.memorySize ? new Array(component.memorySize).fill(0) : null,
      },
    };
    addNode(newNode);
  };

  const renderComponentCard = (component) => (
    <div
      key={component.type}
      style={{
        backgroundColor: currentTheme.surface,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => handleAddComponent(component)}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = `0 8px 24px ${currentTheme.primary}30`;
        e.target.style.borderColor = currentTheme.primary;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
        e.target.style.borderColor = currentTheme.border;
      }}
    >
      {/* Component Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '4px',
            }}
          >
            {component.label}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
              lineHeight: '1.4',
            }}
          >
            {component.description}
          </div>
        </div>
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: currentTheme.primary,
            borderRadius: '8px',
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
      </div>

      {/* Timing Specifications */}
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
            fontSize: '11px',
            fontWeight: '600',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Timing Specifications
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '10px',
          }}
        >
          {component.setupTime && (
            <div>
              <div style={{ color: currentTheme.text.secondary }}>Setup Time</div>
              <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>
                {component.setupTime}ns
              </div>
            </div>
          )}
          {component.holdTime && (
            <div>
              <div style={{ color: currentTheme.text.secondary }}>Hold Time</div>
              <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>
                {component.holdTime}ns
              </div>
            </div>
          )}
          {component.propagationDelay && (
            <div>
              <div style={{ color: currentTheme.text.secondary }}>Propagation</div>
              <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>
                {component.propagationDelay}ns
              </div>
            </div>
          )}
          {component.accessTime && (
            <div>
              <div style={{ color: currentTheme.text.secondary }}>Access Time</div>
              <div style={{ fontWeight: '600', color: currentTheme.text.primary }}>
                {component.accessTime}ns
              </div>
            </div>
          )}
        </div>
      </div>

      {/* I/O Information */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          fontSize: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: `${currentTheme.success}15`,
            borderRadius: '4px',
            color: currentTheme.success,
          }}
        >
          <span>→</span>
          <span>{component.inputs?.length || 0} Inputs</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            backgroundColor: `${currentTheme.error}15`,
            borderRadius: '4px',
            color: currentTheme.error,
          }}
        >
          <span>←</span>
          <span>{component.outputs?.length || 0} Outputs</span>
        </div>
      </div>

      {/* Special Properties */}
      {component.memorySize && (
        <div
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: `${currentTheme.accent}15`,
            borderRadius: '4px',
            fontSize: '10px',
            color: currentTheme.accent,
          }}
        >
          Memory: {component.memorySize} × {component.dataWidth} bits
        </div>
      )}
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
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>⏱️</span>
          Advanced Sequential Logic
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {Object.keys(sequentialComponents).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '6px 12px',
                backgroundColor: activeCategory === category ? currentTheme.primary : 'transparent',
                color: activeCategory === category ? 'white' : currentTheme.text.secondary,
                border: `1px solid ${activeCategory === category ? currentTheme.primary : currentTheme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
              }}
            >
              {category.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {sequentialComponents[activeCategory]?.map(renderComponentCard)}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSequentialComponents;
