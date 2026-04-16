import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedSimulationModes = () => {
  const { currentTheme } = useTheme;
  const { nodes, edges, updateNode } = useCircuitStore();
  
  const [simulationMode, setSimulationMode] = useState('functional');
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    currentTime: 0,
    stepSize: 0.1,
    maxTime: 100,
    frequency: 1000, // MHz
    voltage: 1.2, // V
    temperature: 25, // °C
    process: 'typical'
  });
  
  const [functionalResults, setFunctionalResults] = useState({
    truthTable: [],
    propagationDelays: new Map(),
    signalTransitions: []
  });
  
  const [timingResults, setTimingResults] = useState({
    timingPaths: [],
    criticalPath: null,
    setupViolations: [],
    holdViolations: [],
    maxFrequency: 0,
    totalDelay: 0
  });
  
  const [powerResults, setPowerResults] = useState({
    dynamicPower: 0,
    staticPower: 0,
    totalPower: 0,
    powerDensity: 0,
    switchingActivity: new Map(),
    leakageCurrent: 0
  });

  const simulationRef = useRef(null);

  // Simulation modes
  const simulationModes = [
    {
      id: 'functional',
      name: 'Functional Simulation',
      description: 'Basic logic functionality verification',
      icon: 'F',
      color: currentTheme.primary
    },
    {
      id: 'timing',
      name: 'Timing Simulation',
      description: 'Propagation delay and timing analysis',
      icon: 'T',
      color: currentTheme.secondary
    },
    {
      id: 'power',
      name: 'Power Analysis',
      description: 'Power consumption and leakage analysis',
      icon: 'P',
      color: currentTheme.accent
    }
  ];

  // Component library with timing and power characteristics
  const componentLibrary = {
    'AND': {
      delay: 0.1, // ns
      power: 0.5, // mW
      leakage: 0.01, // nW
      riseTime: 0.05,
      fallTime: 0.05,
      setupTime: 0.02,
      holdTime: 0.01,
      capacitance: 0.1 // pF
    },
    'OR': {
      delay: 0.12,
      power: 0.6,
      leakage: 0.012,
      riseTime: 0.06,
      fallTime: 0.06,
      setupTime: 0.025,
      holdTime: 0.012,
      capacitance: 0.12
    },
    'NOT': {
      delay: 0.05,
      power: 0.3,
      leakage: 0.008,
      riseTime: 0.03,
      fallTime: 0.03,
      setupTime: 0.01,
      holdTime: 0.005,
      capacitance: 0.05
    },
    'XOR': {
      delay: 0.2,
      power: 0.8,
      leakage: 0.02,
      riseTime: 0.1,
      fallTime: 0.1,
      setupTime: 0.04,
      holdTime: 0.02,
      capacitance: 0.2
    },
    'NAND': {
      delay: 0.08,
      power: 0.4,
      leakage: 0.009,
      riseTime: 0.04,
      fallTime: 0.04,
      setupTime: 0.018,
      holdTime: 0.009,
      capacitance: 0.08
    },
    'NOR': {
      delay: 0.09,
      power: 0.45,
      leakage: 0.01,
      riseTime: 0.045,
      fallTime: 0.045,
      setupTime: 0.02,
      holdTime: 0.01,
      capacitance: 0.09
    },
    'D_FLIP_FLOP': {
      delay: 0.3,
      power: 1.2,
      leakage: 0.05,
      riseTime: 0.15,
      fallTime: 0.15,
      setupTime: 0.05,
      holdTime: 0.02,
      capacitance: 0.3
    },
    'JK_FLIP_FLOP': {
      delay: 0.35,
      power: 1.5,
      leakage: 0.06,
      riseTime: 0.18,
      fallTime: 0.18,
      setupTime: 0.06,
      holdTime: 0.03,
      capacitance: 0.35
    }
  };

  // Process corners
  const processCorners = {
    'typical': { delay: 1.0, power: 1.0, leakage: 1.0 },
    'slow': { delay: 1.2, power: 0.8, leakage: 0.7 },
    'fast': { delay: 0.8, power: 1.2, leakage: 1.5 }
  };

  // Temperature effects
  const getTemperatureFactor = (temp) => {
    // Simplified temperature model
    const nominalTemp = 25; // °C
    const tempCoeff = 0.002; // per °C
    return 1 + (temp - nominalTemp) * tempCoeff;
  };

  // Voltage effects
  const getVoltageFactor = (voltage) => {
    // Simplified voltage scaling model
    const nominalVoltage = 1.2; // V
    const voltageExp = 1.5; // voltage exponent
    return Math.pow(voltage / nominalVoltage, voltageExp);
  };

  // Functional simulation
  const runFunctionalSimulation = () => {
    const truthTable = generateTruthTable();
    const propagationDelays = new Map();
    const signalTransitions = [];
    
    // Generate all input combinations
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      setFunctionalResults({
        truthTable: [],
        propagationDelays: new Map(),
        signalTransitions: []
      });
      return;
    }
    
    const numInputs = inputNodes.length;
    const numCombinations = Math.pow(2, numInputs);
    
    for (let i = 0; i < numCombinations; i++) {
      const inputCombination = {};
      const outputCombination = {};
      
      // Set input values
      inputNodes.forEach((node, index) => {
        const value = (i >> (numInputs - 1 - index)) & 1;
        inputCombination[node.id] = value;
        updateNode(node.id, { data: { ...node.data, value } });
      });
      
      // Propagate through circuit
      const circuitOutput = propagateLogic();
      
      // Record output values
      outputNodes.forEach(node => {
        outputCombination[node.id] = circuitOutput[node.id] || false;
      });
      
      truthTable.push({
        inputs: inputCombination,
        outputs: outputCombination
      });
      
      // Record signal transitions
      signalTransitions.push({
        combination: i,
        timestamp: i * simulationState.stepSize,
        values: { ...inputCombination, ...outputCombination }
      });
    }
    
    setFunctionalResults({
      truthTable,
      propagationDelays,
      signalTransitions
    });
  };

  // Timing simulation
  const runTimingSimulation = () => {
    const timingPaths = [];
    const setupViolations = [];
    const holdViolations = [];
    const processFactor = processCorners[simulationState.process];
    const tempFactor = getTemperatureFactor(simulationState.temperature);
    const voltFactor = getVoltageFactor(simulationState.voltage);
    
    // Find all timing paths
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    inputNodes.forEach(inputNode => {
      outputNodes.forEach(outputNode => {
        const path = findTimingPath(inputNode.id, outputNode.id);
        if (path.length > 0) {
          const pathDelay = calculatePathDelay(path, processFactor, tempFactor, voltFactor);
          timingPaths.push({
            from: inputNode.id,
            to: outputNode.id,
            path,
            delay: pathDelay
          });
        }
      });
    });
    
    // Find critical path
    const criticalPath = timingPaths.reduce((max, path) => 
      path.delay > max.delay ? path : max, 
      timingPaths[0] || { delay: 0 }
    );
    
    // Check setup and hold violations
    nodes.forEach(node => {
      const nodeType = node.data.label;
      const comp = componentLibrary[nodeType];
      
      if (comp && nodeType.includes('FLIP_FLOP')) {
        // Check setup violations
        if (criticalPath.delay > comp.setupTime) {
          setupViolations.push({
            node: node.id,
            type: 'setup',
            required: comp.setupTime,
            actual: criticalPath.delay,
            slack: comp.setupTime - criticalPath.delay
          });
        }
        
        // Check hold violations
        if (criticalPath.delay < comp.holdTime) {
          holdViolations.push({
            node: node.id,
            type: 'hold',
            required: comp.holdTime,
            actual: criticalPath.delay,
            slack: criticalPath.delay - comp.holdTime
          });
        }
      }
    });
    
    // Calculate maximum frequency
    const maxFrequency = criticalPath.delay > 0 ? 1000 / criticalPath.delay : 0; // MHz
    
    setTimingResults({
      timingPaths,
      criticalPath,
      setupViolations,
      holdViolations,
      maxFrequency,
      totalDelay: criticalPath.delay
    });
  };

  // Power analysis
  const runPowerAnalysis = () => {
    let dynamicPower = 0;
    let staticPower = 0;
    let totalPower = 0;
    let powerDensity = 0;
    const switchingActivity = new Map();
    let leakageCurrent = 0;
    
    const processFactor = processCorners[simulationState.process];
    const tempFactor = getTemperatureFactor(simulationState.temperature);
    const voltFactor = getVoltageFactor(simulationState.voltage);
    
    nodes.forEach(node => {
      const nodeType = node.data.label;
      const comp = componentLibrary[nodeType];
      
      if (comp) {
        // Dynamic power: P = CV²f
        const capacitance = comp.capacitance * 1e-12; // Convert pF to F
        const voltage = simulationState.voltage;
        const frequency = simulationState.frequency * 1e6; // Convert MHz to Hz
        const activityFactor = 0.5; // Assume 50% activity
        
        const nodeDynamicPower = capacitance * voltage * voltage * frequency * activityFactor * voltFactor * voltFactor;
        
        // Static (leakage) power
        const nodeStaticPower = comp.leakage * 1e-9 * voltage * tempFactor * processFactor.leakage;
        
        dynamicPower += nodeDynamicPower;
        staticPower += nodeStaticPower;
        
        switchingActivity.set(node.id, {
          dynamic: nodeDynamicPower,
          static: nodeStaticPower,
          total: nodeDynamicPower + nodeStaticPower
        });
        
        leakageCurrent += comp.leakage * tempFactor * processFactor.leakage;
      }
    });
    
    totalPower = dynamicPower + staticPower;
    
    // Calculate power density (W/mm²)
    const circuitArea = nodes.length * 0.01; // Assume 0.01 mm² per cell
    powerDensity = totalPower / circuitArea;
    
    setPowerResults({
      dynamicPower,
      staticPower,
      totalPower,
      powerDensity,
      switchingActivity,
      leakageCurrent
    });
  };

  // Find timing path between two nodes
  const findTimingPath = (startId, endId) => {
    const path = [];
    const visited = new Set();
    
    const dfs = (currentId, currentPath) => {
      if (currentId === endId) {
        path.push(...currentPath, currentId);
        return true;
      }
      
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      
      const outgoingEdges = edges.filter(e => e.source === currentId);
      for (const edge of outgoingEdges) {
        if (dfs(edge.target, [...currentPath, currentId])) {
          return true;
        }
      }
      
      return false;
    };
    
    dfs(startId, []);
    return path;
  };

  // Calculate path delay
  const calculatePathDelay = (path, processFactor, tempFactor, voltFactor) => {
    let totalDelay = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const node = nodes.find(n => n.id === path[i + 1]);
      if (node) {
        const comp = componentLibrary[node.data.label];
        if (comp) {
          const nodeDelay = comp.delay * processFactor.delay * tempFactor / voltFactor;
          totalDelay += nodeDelay;
        }
      }
    }
    
    return totalDelay;
  };

  // Generate truth table
  const generateTruthTable = () => {
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    const truthTable = [];
    
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      return truthTable;
    }
    
    const numInputs = inputNodes.length;
    const numCombinations = Math.pow(2, numInputs);
    
    for (let i = 0; i < numCombinations; i++) {
      const inputCombination = {};
      const outputCombination = {};
      
      // Set input values
      inputNodes.forEach((node, index) => {
        const value = (i >> (numInputs - 1 - index)) & 1;
        inputCombination[node.id] = value;
      });
      
      // Calculate outputs
      const circuitOutput = calculateOutputs(inputCombination);
      
      // Record output values
      outputNodes.forEach(node => {
        outputCombination[node.id] = circuitOutput[node.id] || false;
      });
      
      truthTable.push({
        inputs: inputCombination,
        outputs: outputCombination
      });
    }
    
    return truthTable;
  };

  // Calculate circuit outputs
  const calculateOutputs = (inputValues) => {
    const outputs = {};
    
    // Simple logic evaluation
    nodes.forEach(node => {
      if (node.data.label === 'INPUT') {
        outputs[node.id] = inputValues[node.id] || false;
      } else {
        const inputs = edges
          .filter(e => e.target === node.id)
          .map(edge => outputs[edge.source] || false);
        
        outputs[node.id] = evaluateGate(node.data.label, inputs);
      }
    });
    
    return outputs;
  };

  // Evaluate gate logic
  const evaluateGate = (gateType, inputs) => {
    switch (gateType) {
      case 'AND':
        return inputs.length >= 2 ? inputs.every(Boolean) : false;
      case 'OR':
        return inputs.some(Boolean);
      case 'NOT':
        return inputs.length === 1 ? !inputs[0] : false;
      case 'XOR':
        return inputs.length >= 2 ? inputs.reduce((acc, val) => acc ^ val, false) : false;
      case 'NAND':
        return inputs.length >= 2 ? !inputs.every(Boolean) : false;
      case 'NOR':
        return inputs.length >= 2 ? !inputs.some(Boolean) : false;
      case 'XNOR':
        return inputs.length >= 2 ? !(inputs.reduce((acc, val) => acc ^ val, false)) : false;
      case 'OUTPUT':
        return inputs.length > 0 ? inputs[0] : false;
      default:
        return false;
    }
  };

  // Propagate logic through circuit
  const propagateLogic = () => {
    const outputs = {};
    const processed = new Set();
    
    // Process nodes in topological order
    const processNode = (nodeId) => {
      if (processed.has(nodeId)) return outputs[nodeId];
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return false;
      
      if (node.data.label === 'INPUT') {
        outputs[nodeId] = node.data.value || false;
      } else {
        const inputs = edges
          .filter(e => e.target === nodeId)
          .map(edge => processNode(edge.source));
        
        outputs[nodeId] = evaluateGate(node.data.label, inputs);
      }
      
      processed.add(nodeId);
      return outputs[nodeId];
    };
    
    nodes.forEach(node => {
      processNode(node.id);
    });
    
    return outputs;
  };

  // Run simulation based on mode
  const runSimulation = () => {
    switch (simulationMode) {
      case 'functional':
        runFunctionalSimulation();
        break;
      case 'timing':
        runTimingSimulation();
        break;
      case 'power':
        runPowerAnalysis();
        break;
    }
  };

  // Start/stop simulation
  const toggleSimulation = () => {
    if (simulationState.isRunning) {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
      setSimulationState(prev => ({ ...prev, isRunning: false }));
    } else {
      setSimulationState(prev => ({ ...prev, isRunning: true }));
      runSimulation();
      
      // Run continuous simulation for functional mode
      if (simulationMode === 'functional') {
        simulationRef.current = setInterval(() => {
          setSimulationState(prev => ({
            ...prev,
            currentTime: prev.currentTime + prev.stepSize
          }));
        }, 100);
      }
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
    
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      currentTime: 0
    }));
    
    // Reset results
    setFunctionalResults({
      truthTable: [],
      propagationDelays: new Map(),
      signalTransitions: []
    });
    setTimingResults({
      timingPaths: [],
      criticalPath: null,
      setupViolations: [],
      holdViolations: [],
      maxFrequency: 0,
      totalDelay: 0
    });
    setPowerResults({
      dynamicPower: 0,
      staticPower: 0,
      totalPower: 0,
      powerDensity: 0,
      switchingActivity: new Map(),
      leakageCurrent: 0
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

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
          <span style={{ fontSize: '20px' }}>Sim</span>
          Advanced Simulation Modes
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={toggleSimulation}
            style={{
              padding: '6px 12px',
              backgroundColor: simulationState.isRunning ? currentTheme.error : currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {simulationState.isRunning ? 'Stop' : 'Run'}
          </button>

          <button
            onClick={runSimulation}
            disabled={simulationState.isRunning}
            style={{
              padding: '6px 12px',
              backgroundColor: simulationState.isRunning ? currentTheme.text.secondary : currentTheme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: simulationState.isRunning ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Analyze
          </button>

          <button
            onClick={resetSimulation}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Reset
          </button>

          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
              marginLeft: '8px',
            }}
          >
            Time: {simulationState.currentTime.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Mode Selection */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <label
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
            }}
          >
            Mode:
          </label>
          <div
            style={{
              display: 'flex',
              gap: '4px',
            }}
          >
            {simulationModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSimulationMode(mode.id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: simulationMode === mode.id ? mode.color : 'transparent',
                  color: simulationMode === mode.id ? 'white' : currentTheme.text.secondary,
                  border: `1px solid ${simulationMode === mode.id ? mode.color : currentTheme.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '500',
                }}
              >
                {mode.icon} {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Parameters */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Process:
            </label>
            <select
              value={simulationState.process}
              onChange={(e) => setSimulationState(prev => ({ ...prev, process: e.target.value }))}
              style={{
                padding: '4px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '10px',
                color: currentTheme.text.primary,
              }}
            >
              <option value="typical">Typical</option>
              <option value="slow">Slow</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Voltage:
            </label>
            <input
              type="number"
              value={simulationState.voltage}
              onChange={(e) => setSimulationState(prev => ({ ...prev, voltage: parseFloat(e.target.value) }))}
              step="0.1"
              min="0.8"
              max="1.5"
              style={{
                width: '60px',
                padding: '4px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '10px',
                color: currentTheme.text.primary,
              }}
            />
            <span
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
              }}
            >
              V
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Temp:
            </label>
            <input
              type="number"
              value={simulationState.temperature}
              onChange={(e) => setSimulationState(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              step="5"
              min="-40"
              max="125"
              style={{
                width: '60px',
                padding: '4px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '10px',
                color: currentTheme.text.primary,
              }}
            />
            <span
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
              }}
            >
              °C
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {simulationMode === 'functional' && (
          <FunctionalResults results={functionalResults} theme={currentTheme} />
        )}
        
        {simulationMode === 'timing' && (
          <TimingResults results={timingResults} theme={currentTheme} />
        )}
        
        {simulationMode === 'power' && (
          <PowerResults results={powerResults} theme={currentTheme} />
        )}
      </div>
    </div>
  );
};

// Functional Results Component
const FunctionalResults = ({ results, theme }) => {
  return (
    <div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.text.primary,
          marginBottom: '12px',
        }}
      >
        Functional Analysis Results
      </div>

      {results.truthTable.length > 0 && (
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
            overflow: 'auto',
            maxHeight: '300px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: `${theme.primary}15`,
                }}
              >
                <th
                  style={{
                    padding: '6px',
                    border: `1px solid ${theme.border}`,
                    color: theme.text.primary,
                    fontWeight: '600',
                  }}
                >
                  #
                </th>
                {Object.keys(results.truthTable[0].inputs).map((input, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '6px',
                      border: `1px solid ${theme.border}`,
                      color: theme.text.primary,
                      fontWeight: '600',
                    }}
                  >
                    {input}
                  </th>
                ))}
                {Object.keys(results.truthTable[0].outputs).map((output, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '6px',
                      border: `1px solid ${theme.border}`,
                      color: theme.text.primary,
                      fontWeight: '600',
                    }}
                  >
                    {output}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.truthTable.map((row, index) => (
                <tr key={index}>
                  <td
                    style={{
                      padding: '4px',
                      border: `1px solid ${theme.border}`,
                      color: theme.text.secondary,
                      textAlign: 'center',
                    }}
                  >
                    {index}
                  </td>
                  {Object.values(row.inputs).map((value, i) => (
                    <td
                      key={i}
                      style={{
                        padding: '4px',
                        border: `1px solid ${theme.border}`,
                        color: theme.text.secondary,
                        textAlign: 'center',
                      }}
                    >
                      {value}
                    </td>
                  ))}
                  {Object.values(row.outputs).map((value, i) => (
                    <td
                      key={i}
                      style={{
                        padding: '4px',
                        border: `1px solid ${theme.border}`,
                        color: value ? theme.success : theme.error,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Test Cases
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.truthTable.length}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Signal Transitions
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.signalTransitions.length}
          </div>
        </div>
      </div>
    </div>
  );
};

// Timing Results Component
const TimingResults = ({ results, theme }) => {
  return (
    <div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.text.primary,
          marginBottom: '12px',
        }}
      >
        Timing Analysis Results
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Critical Path Delay
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.totalDelay.toFixed(2)} ns
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Max Frequency
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.maxFrequency.toFixed(0)} MHz
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Timing Paths
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.timingPaths.length}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Violations
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: results.setupViolations.length + results.holdViolations.length > 0 ? theme.error : theme.success,
            }}
          >
            {results.setupViolations.length + results.holdViolations.length}
          </div>
        </div>
      </div>

      {/* Critical Path */}
      {results.criticalPath && (
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '8px',
            }}
          >
            Critical Path
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {results.criticalPath.path.map((nodeId, index) => (
              <React.Fragment key={nodeId}>
                <div
                  style={{
                    padding: '4px 8px',
                    backgroundColor: `${theme.primary}20`,
                    border: `1px solid ${theme.primary}`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: theme.primary,
                    fontWeight: '600',
                  }}
                >
                  {nodeId}
                </div>
                {index < results.criticalPath.path.length - 1 && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: theme.text.secondary,
                    }}
                  >
                    {'->'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: theme.text.secondary,
              marginTop: '8px',
            }}
          >
            Total delay: {results.criticalPath.delay.toFixed(2)} ns
          </div>
        </div>
      )}

      {/* Timing Violations */}
      {(results.setupViolations.length > 0 || results.holdViolations.length > 0) && (
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '8px',
            }}
          >
            Timing Violations
          </div>

          {results.setupViolations.map((violation, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: `${theme.error}15`,
                border: `1px solid ${theme.error}`,
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: theme.error,
                  marginBottom: '4px',
                }}
              >
                Setup Violation - {violation.node}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: theme.text.secondary,
                }}
              >
                Required: {violation.required.toFixed(3)} ns, Actual: {violation.actual.toFixed(3)} ns, Slack: {violation.slack.toFixed(3)} ns
              </div>
            </div>
          ))}

          {results.holdViolations.map((violation, index) => (
            <div
              key={index}
              style={{
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: `${theme.warning}15`,
                border: `1px solid ${theme.warning}`,
                borderRadius: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: theme.warning,
                  marginBottom: '4px',
                }}
              >
                Hold Violation - {violation.node}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: theme.text.secondary,
                }}
              >
                Required: {violation.required.toFixed(3)} ns, Actual: {violation.actual.toFixed(3)} ns, Slack: {violation.slack.toFixed(3)} ns
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Power Results Component
const PowerResults = ({ results, theme }) => {
  return (
    <div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.text.primary,
          marginBottom: '12px',
        }}
      >
        Power Analysis Results
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Total Power
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {(results.totalPower * 1000).toFixed(2)} mW
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Dynamic Power
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.secondary,
            }}
          >
            {(results.dynamicPower * 1000).toFixed(2)} mW
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Static Power
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.accent,
            }}
          >
            {(results.staticPower * 1000000).toFixed(2)} nW
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '4px',
            }}
          >
            Power Density
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.primary,
            }}
          >
            {results.powerDensity.toFixed(2)} W/mm²
          </div>
        </div>
      </div>

      {/* Power Breakdown */}
      <div
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: '8px',
          }}
        >
          Power Breakdown
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: theme.text.secondary,
                marginBottom: '4px',
              }}
            >
              Dynamic Power
            </div>
            <div
              style={{
                height: '20px',
                backgroundColor: theme.background,
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(results.dynamicPower / results.totalPower) * 100}%`,
                  height: '100%',
                  backgroundColor: theme.secondary,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '10px',
                color: theme.text.secondary,
                marginTop: '4px',
              }}
            >
              {((results.dynamicPower / results.totalPower) * 100).toFixed(1)}%
            </div>
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: theme.text.secondary,
                marginBottom: '4px',
              }}
            >
              Static Power
            </div>
            <div
              style={{
                height: '20px',
                backgroundColor: theme.background,
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(results.staticPower / results.totalPower) * 100}%`,
                  height: '100%',
                  backgroundColor: theme.accent,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '10px',
                color: theme.text.secondary,
                marginTop: '4px',
              }}
            >
              {((results.staticPower / results.totalPower) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Component Power */}
      {results.switchingActivity.size > 0 && (
        <div
          style={{
            backgroundColor: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: '8px',
            }}
          >
            Component Power
          </div>

          <div
            style={{
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            {Array.from(results.switchingActivity.entries()).map(([nodeId, power]) => (
              <div
                key={nodeId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: theme.text.primary,
                  }}
                >
                  {nodeId}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: theme.text.secondary,
                  }}
                >
                  {(power.total * 1000).toFixed(3)} mW
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSimulationModes;
