import React, { useState, useEffect, useRef, useCallback } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const SimulationEngine = () => {
  const { nodes, edges } = useCircuitStore();
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per cycle
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testInputs, setTestInputs] = useState({});
  const simulationInterval = useRef(null);
  const canvasRef = useRef(null);

  // Gate logic functions
  const gateLogic = {
    'AND': (inputs) => inputs.every(i => i === 1 || i === true) ? 1 : 0,
    'OR': (inputs) => inputs.some(i => i === 1 || i === true) ? 1 : 0,
    'NOT': (inputs) => inputs[0] === 1 || inputs[0] === true ? 0 : 1,
    'XOR': (inputs) => inputs.reduce((acc, val) => acc ^ (val === 1 || val === true ? 1 : 0), 0),
    'NAND': (inputs) => inputs.every(i => i === 1 || i === true) ? 0 : 1,
    'NOR': (inputs) => inputs.some(i => i === 1 || i === true) ? 0 : 1,
    'XNOR': (inputs) => inputs.reduce((acc, val) => acc ^ (val === 1 || val === true ? 1 : 0), 0) ? 0 : 1,
    'BUFFER': (inputs) => inputs[0] === 1 || inputs[0] === true ? 1 : 0
  };

  // Initialize simulation data structures
  const initializeSimulation = useCallback(() => {
    const initialWaveform = {};
    const initialInputs = {};
    
    nodes.forEach(node => {
      initialWaveform[node.id] = [];
      if (node.data.label === 'INPUT') {
        initialInputs[node.id] = 0;
      }
    });
    
    setWaveformData(initialWaveform);
    setTestInputs(initialInputs);
    setCurrentTime(0);
  }, [nodes]);

  // Simulate one clock cycle
  const simulateCycle = useCallback(() => {
    const newWaveform = { ...waveformData };
    const nodeValues = {};
    
    // Set input values
    Object.keys(testInputs).forEach(nodeId => {
      nodeValues[nodeId] = testInputs[nodeId];
    });
    
    // Topological sort for proper evaluation order
    const sortedNodes = topologicalSort();
    
    // Evaluate each node
    sortedNodes.forEach(node => {
      if (node.data.label === 'INPUT') {
        nodeValues[node.id] = testInputs[node.id] || 0;
      } else if (node.data.label === 'OUTPUT') {
        // Find connected input gates
        const connectedEdges = edges.filter(edge => edge.target === node.id);
        if (connectedEdges.length > 0) {
          const sourceNode = connectedEdges[0].source;
          nodeValues[node.id] = nodeValues[sourceNode] || 0;
        }
      } else if (gateLogic[node.data.label]) {
        // Get input values for this gate
        const inputEdges = edges.filter(edge => edge.target === node.id);
        const inputValues = inputEdges.map(edge => nodeValues[edge.source] || 0);
        
        if (inputValues.length > 0) {
          nodeValues[node.id] = gateLogic[node.data.label](inputValues);
        }
      }
      
      // Store waveform data
      if (!newWaveform[node.id]) {
        newWaveform[node.id] = [];
      }
      newWaveform[node.id].push({
        time: currentTime,
        value: nodeValues[node.id] || 0
      });
    });
    
    setWaveformData(newWaveform);
    setCurrentTime(prev => prev + 1);
  }, [waveformData, testInputs, nodes, edges, currentTime]);

  // Topological sort for circuit evaluation
  const topologicalSort = () => {
    const visited = new Set();
    const sorted = [];
    
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit dependencies first
      const inputEdges = edges.filter(edge => edge.target === nodeId);
      inputEdges.forEach(edge => visit(edge.source));
      
      sorted.push(nodes.find(n => n.id === nodeId));
    };
    
    nodes.forEach(node => visit(node.id));
    return sorted;
  };

  // Start/stop simulation
  const toggleSimulation = () => {
    if (isRunning) {
      clearInterval(simulationInterval.current);
      setIsRunning(false);
    } else {
      simulationInterval.current = setInterval(simulateCycle, simulationSpeed);
      setIsRunning(true);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    clearInterval(simulationInterval.current);
    setIsRunning(false);
    initializeSimulation();
  };

  // Update input value
  const updateInput = (nodeId, value) => {
    setTestInputs(prev => ({
      ...prev,
      [nodeId]: parseInt(value) || 0
    }));
  };

  // Draw waveforms
  const drawWaveforms = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw waveforms
    const signalNodes = nodes.filter(node => 
      node.data.label === 'INPUT' || 
      node.data.label === 'OUTPUT' ||
      gateLogic[node.data.label]
    );
    
    const signalHeight = height / signalNodes.length;
    
    signalNodes.forEach((node, index) => {
      const y = index * signalHeight + signalHeight / 2;
      const waveform = waveformData[node.id] || [];
      
      // Draw signal name
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px monospace';
      ctx.fillText(node.data.label || node.id, 5, y - signalHeight / 2 + 10);
      
      // Draw waveform
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      waveform.forEach((point, i) => {
        const x = (i / Math.max(waveform.length - 1, 1)) * (width - 100) + 80;
        const signalY = point.value === 1 ? y - signalHeight / 4 : y + signalHeight / 4;
        
        if (i === 0) {
          ctx.moveTo(x, signalY);
        } else {
          const prevPoint = waveform[i - 1];
          const prevX = ((i - 1) / Math.max(waveform.length - 1, 1)) * (width - 100) + 80;
          const prevY = prevPoint.value === 1 ? y - signalHeight / 4 : y + signalHeight / 4;
          
          // Draw vertical line if value changed
          if (prevPoint.value !== point.value) {
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, signalY);
          } else {
            ctx.lineTo(x, signalY);
          }
        }
      });
      
      ctx.stroke();
    });
  }, [waveformData, nodes]);

  // Test cases
  const testCases = [
    {
      name: 'Basic AND Gate',
      description: 'Test AND gate functionality',
      inputs: { 'input1': [1, 1, 0, 0], 'input2': [1, 0, 1, 0] },
      expectedOutputs: { 'output1': [1, 0, 0, 0] },
      duration: 4
    },
    {
      name: 'Half Adder',
      description: 'Test half adder circuit',
      inputs: { 'a': [0, 0, 1, 1], 'b': [0, 1, 0, 1] },
      expectedOutputs: { 'sum': [0, 1, 1, 0], 'carry': [0, 0, 0, 1] },
      duration: 4
    },
    {
      name: 'SR Latch',
      description: 'Test SR latch behavior',
      inputs: { 's': [1, 0, 0, 0], 'r': [0, 0, 1, 0] },
      expectedOutputs: { 'q': [1, 1, 0, 0], 'q_bar': [0, 0, 1, 1] },
      duration: 4
    },
    {
      name: 'Ripple Counter',
      description: 'Test 2-bit ripple counter',
      inputs: { 'clk': [0, 1, 0, 1, 0, 1, 0, 1] },
      expectedOutputs: { 'q0': [0, 1, 0, 1, 0, 1, 0, 1], 'q1': [0, 0, 1, 1, 0, 0, 1, 1] },
      duration: 8
    }
  ];

  // Run automated test
  const runTest = async (testCase) => {
    resetSimulation();
    setSelectedTest(testCase);
    setTestResults([]);
    
    const results = [];
    
    for (let i = 0; i < testCase.duration; i++) {
      // Set inputs for this cycle
      Object.keys(testCase.inputs).forEach(inputId => {
        const inputNode = nodes.find(n => n.data.label === 'INPUT' && n.id.includes(inputId));
        if (inputNode) {
          updateInput(inputNode.id, testCase.inputs[inputId][i]);
        }
      });
      
      // Simulate one cycle
      await simulateCycle();
      
      // Check outputs
      const cycleResults = {};
      Object.keys(testCase.expectedOutputs).forEach(outputId => {
        const outputNode = nodes.find(n => n.data.label === 'OUTPUT' && n.id.includes(outputId));
        if (outputNode) {
          const actualValue = waveformData[outputNode.id]?.[waveformData[outputNode.id].length - 1]?.value || 0;
          const expectedValue = testCase.expectedOutputs[outputId][i];
          cycleResults[outputId] = {
            expected: expectedValue,
            actual: actualValue,
            pass: actualValue === expectedValue
          };
        }
      });
      
      results.push({
        cycle: i,
        results: cycleResults,
        pass: Object.values(cycleResults).every(r => r.pass)
      });
    }
    
    setTestResults(results);
  };

  // Effects
  useEffect(() => {
    initializeSimulation();
    return () => clearInterval(simulationInterval.current);
  }, [initializeSimulation]);

  useEffect(() => {
    drawWaveforms();
  }, [drawWaveforms]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'transparent',
      padding: '0px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: '700', 
        color: '#f8fafc',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Simulation Engine
      </div>
      
      {/* Simulation Controls */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Simulation Controls:
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          <button
            onClick={toggleSimulation}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: isRunning ? '#ef4444' : '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={resetSimulation}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#6b7280',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '8px', color: '#cbd5e1' }}>Speed:</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '8px', color: '#cbd5e1' }}>{simulationSpeed}ms</span>
        </div>
      </div>

      {/* Input Controls */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Input Controls:
        </div>
        <div style={{ 
          maxHeight: '80px', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          {nodes.filter(node => node.data.label === 'INPUT').map(node => (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '8px', color: '#cbd5e1', minWidth: '60px' }}>
                {node.data.label}:
              </span>
              <button
                onClick={() => updateInput(node.id, 0)}
                style={{
                  padding: '2px 6px',
                  backgroundColor: testInputs[node.id] === 0 ? '#3b82f6' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '3px',
                  color: 'white',
                  fontSize: '7px',
                  cursor: 'pointer'
                }}
              >
                0
              </button>
              <button
                onClick={() => updateInput(node.id, 1)}
                style={{
                  padding: '2px 6px',
                  backgroundColor: testInputs[node.id] === 1 ? '#3b82f6' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '3px',
                  color: 'white',
                  fontSize: '7px',
                  cursor: 'pointer'
                }}
              >
                1
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Testing */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Automated Tests:
        </div>
        <div style={{ 
          maxHeight: '60px', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {testCases.map(test => (
            <button
              key={test.name}
              onClick={() => runTest(test)}
              disabled={isRunning}
              style={{
                padding: '4px',
                backgroundColor: selectedTest?.name === test.name ? '#3b82f6' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: '3px',
                color: 'white',
                fontSize: '7px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: '600' }}>{test.name}</div>
              <div style={{ fontSize: '6px', color: '#94a3b8' }}>{test.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ 
            fontSize: '10px', 
            fontWeight: '600', 
            color: '#cbd5e1',
            marginBottom: '4px'
          }}>
            Test Results:
          </div>
          <div style={{ 
            maxHeight: '60px', 
            overflow: 'auto',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '4px'
          }}>
            {testResults.map(result => (
              <div key={result.cycle} style={{ 
                fontSize: '7px', 
                color: result.pass ? '#10b981' : '#ef4444',
                marginBottom: '2px'
              }}>
                Cycle {result.cycle}: {result.pass ? 'PASS' : 'FAIL'}
                {!result.pass && (
                  <div style={{ fontSize: '6px', color: '#94a3b8' }}>
                    {Object.entries(result.results)
                      .filter(([_, r]) => !r.pass)
                      .map(([signal, r]) => `${signal}: expected ${r.expected}, got ${r.actual}`)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waveform Display */}
      <div style={{ flex: 1, minHeight: '200px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Waveform Display (Time: {currentTime}):
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );
};

export default SimulationEngine;
