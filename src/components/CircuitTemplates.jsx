import React, { useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const CircuitTemplates = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addNode, addEdge, clearCircuit } = useCircuitStore();

  const templates = [
    {
      name: 'Half Adder',
      description: 'Adds two single bits and produces sum and carry',
      icon: '➕',
      create: () => {
        clearCircuit();
        
        // Create inputs
        const inputA = Date.now().toString();
        const inputB = (Date.now() + 1).toString();
        
        // Create gates
        const xorGate = (Date.now() + 2).toString();
        const andGate = (Date.now() + 3).toString();
        
        // Create outputs
        const sumOutput = (Date.now() + 4).toString();
        const carryOutput = (Date.now() + 5).toString();
        
        // Add nodes
        addNode({
          id: inputA,
          type: 'gate',
          position: { x: 100, y: 100 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: inputB,
          type: 'gate',
          position: { x: 100, y: 200 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: xorGate,
          type: 'gate',
          position: { x: 300, y: 100 },
          data: { label: 'XOR', value: false }
        });
        
        addNode({
          id: andGate,
          type: 'gate',
          position: { x: 300, y: 200 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: sumOutput,
          type: 'gate',
          position: { x: 500, y: 100 },
          data: { label: 'OUTPUT', value: false }
        });
        
        addNode({
          id: carryOutput,
          type: 'gate',
          position: { x: 500, y: 200 },
          data: { label: 'OUTPUT', value: false }
        });
        
        // Add connections
        setTimeout(() => {
          addEdge({ id: 'e1', source: inputA, target: xorGate });
          addEdge({ id: 'e2', source: inputB, target: xorGate });
          addEdge({ id: 'e3', source: inputA, target: andGate });
          addEdge({ id: 'e4', source: inputB, target: andGate });
          addEdge({ id: 'e5', source: xorGate, target: sumOutput });
          addEdge({ id: 'e6', source: andGate, target: carryOutput });
        }, 100);
      }
    },
    {
      name: 'Full Adder',
      description: 'Adds three single bits including carry-in',
      icon: '➕➕',
      create: () => {
        clearCircuit();
        
        // Create inputs
        const inputA = Date.now().toString();
        const inputB = (Date.now() + 1).toString();
        const carryIn = (Date.now() + 2).toString();
        
        // Create gates for first half adder
        const xor1 = (Date.now() + 3).toString();
        const and1 = (Date.now() + 4).toString();
        
        // Create gates for second half adder
        const xor2 = (Date.now() + 5).toString();
        const and2 = (Date.now() + 6).toString();
        
        // Create final gates
        const orGate = (Date.now() + 7).toString();
        
        // Create outputs
        const sumOutput = (Date.now() + 8).toString();
        const carryOutput = (Date.now() + 9).toString();
        
        // Add all nodes
        addNode({
          id: inputA,
          type: 'gate',
          position: { x: 50, y: 100 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: inputB,
          type: 'gate',
          position: { x: 50, y: 200 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: carryIn,
          type: 'gate',
          position: { x: 50, y: 300 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: xor1,
          type: 'gate',
          position: { x: 200, y: 150 },
          data: { label: 'XOR', value: false }
        });
        
        addNode({
          id: and1,
          type: 'gate',
          position: { x: 200, y: 250 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: xor2,
          type: 'gate',
          position: { x: 350, y: 200 },
          data: { label: 'XOR', value: false }
        });
        
        addNode({
          id: and2,
          type: 'gate',
          position: { x: 350, y: 300 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: orGate,
          type: 'gate',
          position: { x: 500, y: 300 },
          data: { label: 'OR', value: false }
        });
        
        addNode({
          id: sumOutput,
          type: 'gate',
          position: { x: 650, y: 200 },
          data: { label: 'OUTPUT', value: false }
        });
        
        addNode({
          id: carryOutput,
          type: 'gate',
          position: { x: 650, y: 300 },
          data: { label: 'OUTPUT', value: false }
        });
        
        // Add connections
        setTimeout(() => {
          // First half adder
          addEdge({ id: 'e1', source: inputA, target: xor1 });
          addEdge({ id: 'e2', source: inputB, target: xor1 });
          addEdge({ id: 'e3', source: inputA, target: and1 });
          addEdge({ id: 'e4', source: inputB, target: and1 });
          
          // Second half adder
          addEdge({ id: 'e5', source: xor1, target: xor2 });
          addEdge({ id: 'e6', source: carryIn, target: xor2 });
          addEdge({ id: 'e7', source: xor1, target: and2 });
          addEdge({ id: 'e8', source: carryIn, target: and2 });
          
          // Final outputs
          addEdge({ id: 'e9', source: xor2, target: sumOutput });
          addEdge({ id: 'e10', source: and1, target: orGate });
          addEdge({ id: 'e11', source: and2, target: orGate });
          addEdge({ id: 'e12', source: orGate, target: carryOutput });
        }, 100);
      }
    },
    {
      name: 'XOR Gate',
      description: 'Exclusive OR using basic gates',
      icon: '⊕',
      create: () => {
        clearCircuit();
        
        // Create inputs
        const inputA = Date.now().toString();
        const inputB = (Date.now() + 1).toString();
        
        // Create gates
        const not1 = (Date.now() + 2).toString();
        const not2 = (Date.now() + 3).toString();
        const and1 = (Date.now() + 4).toString();
        const and2 = (Date.now() + 5).toString();
        const orGate = (Date.now() + 6).toString();
        
        // Create output
        const output = (Date.now() + 7).toString();
        
        // Add nodes
        addNode({
          id: inputA,
          type: 'gate',
          position: { x: 50, y: 100 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: inputB,
          type: 'gate',
          position: { x: 50, y: 200 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: not1,
          type: 'gate',
          position: { x: 200, y: 50 },
          data: { label: 'NOT', value: false }
        });
        
        addNode({
          id: not2,
          type: 'gate',
          position: { x: 200, y: 250 },
          data: { label: 'NOT', value: false }
        });
        
        addNode({
          id: and1,
          type: 'gate',
          position: { x: 350, y: 100 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: and2,
          type: 'gate',
          position: { x: 350, y: 200 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: orGate,
          type: 'gate',
          position: { x: 500, y: 150 },
          data: { label: 'OR', value: false }
        });
        
        addNode({
          id: output,
          type: 'gate',
          position: { x: 650, y: 150 },
          data: { label: 'OUTPUT', value: false }
        });
        
        // Add connections
        setTimeout(() => {
          addEdge({ id: 'e1', source: inputA, target: not1 });
          addEdge({ id: 'e2', source: inputB, target: not2 });
          addEdge({ id: 'e3', source: inputA, target: and2 });
          addEdge({ id: 'e4', source: not2, target: and2 });
          addEdge({ id: 'e5', source: inputB, target: and1 });
          addEdge({ id: 'e6', source: not1, target: and1 });
          addEdge({ id: 'e7', source: and1, target: orGate });
          addEdge({ id: 'e8', source: and2, target: orGate });
          addEdge({ id: 'e9', source: orGate, target: output });
        }, 100);
      }
    },
    {
      name: '2-to-1 MUX',
      description: '2-to-1 Multiplexer',
      icon: '🔀',
      create: () => {
        clearCircuit();
        
        // Create inputs
        const input0 = Date.now().toString();
        const input1 = (Date.now() + 1).toString();
        const select = (Date.now() + 2).toString();
        
        // Create gates
        const not1 = (Date.now() + 3).toString();
        const and1 = (Date.now() + 4).toString();
        const and2 = (Date.now() + 5).toString();
        const orGate = (Date.now() + 6).toString();
        
        // Create output
        const output = (Date.now() + 7).toString();
        
        // Add nodes
        addNode({
          id: input0,
          type: 'gate',
          position: { x: 50, y: 100 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: input1,
          type: 'gate',
          position: { x: 50, y: 200 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: select,
          type: 'gate',
          position: { x: 50, y: 300 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: not1,
          type: 'gate',
          position: { x: 200, y: 300 },
          data: { label: 'NOT', value: false }
        });
        
        addNode({
          id: and1,
          type: 'gate',
          position: { x: 350, y: 100 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: and2,
          type: 'gate',
          position: { x: 350, y: 200 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: orGate,
          type: 'gate',
          position: { x: 500, y: 150 },
          data: { label: 'OR', value: false }
        });
        
        addNode({
          id: output,
          type: 'gate',
          position: { x: 650, y: 150 },
          data: { label: 'OUTPUT', value: false }
        });
        
        // Add connections
        setTimeout(() => {
          addEdge({ id: 'e1', source: select, target: not1 });
          addEdge({ id: 'e2', source: input0, target: and1 });
          addEdge({ id: 'e3', source: not1, target: and1 });
          addEdge({ id: 'e4', source: input1, target: and2 });
          addEdge({ id: 'e5', source: select, target: and2 });
          addEdge({ id: 'e6', source: and1, target: orGate });
          addEdge({ id: 'e7', source: and2, target: orGate });
          addEdge({ id: 'e8', source: orGate, target: output });
        }, 100);
      }
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '12px 20px',
          backgroundColor: '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        📚 Circuit Templates
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxHeight: '80vh',
        overflow: 'auto',
        minWidth: '500px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Circuit Templates</h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {templates.map((template, index) => (
          <div
            key={index}
            style={{
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: '#fafafa',
            }}
            onClick={() => {
              template.create();
              setIsOpen(false);
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e3f2fd';
              e.target.style.borderColor = '#2196F3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fafafa';
              e.target.style.borderColor = '#e0e0e0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>{template.icon}</span>
              <h3 style={{ margin: 0, color: '#333' }}>{template.name}</h3>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {template.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        Click any template to load it. This will replace your current circuit.
      </div>
    </div>
  );
};

export default CircuitTemplates;
