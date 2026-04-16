import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../store/useCircuitStore';

const TimingSimulationPanel = () => {
  const { currentTheme } = useTheme();
  const { 
    nodes, 
    edges, 
    timingEnabled, 
    simulationMode, 
    currentTime,
    toggleTimingMode,
    setSimulationMode,
    simulateSequentialStep,
    getTimingInfo
  } = useCircuitStore();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [timingAnalysis, setTimingAnalysis] = useState(null);

  const simulationModes = [
    { id: 'functional', label: 'Functional', description: 'Instant propagation' },
    { id: 'timing', label: 'Timing', description: 'Propagation delays' },
    { id: 'step', label: 'Step', description: 'Manual stepping' },
  ];

  const speedOptions = [
    { value: 0.1, label: '0.1x', description: 'Slow motion' },
    { value: 0.5, label: '0.5x', description: 'Half speed' },
    { value: 1.0, label: '1.0x', description: 'Normal speed' },
    { value: 2.0, label: '2.0x', description: 'Double speed' },
    { value: 5.0, label: '5.0x', description: 'Fast simulation' },
  ];

  // Analyze timing for selected node
  const analyzeNodeTiming = (nodeId) => {
    const timingInfo = getTimingInfo(nodeId);
    if (timingInfo) {
      const node = nodes.find(n => n.id === nodeId);
      const inputEdges = edges.filter(e => e.target === nodeId);
      const outputEdges = edges.filter(e => e.source === nodeId);
      
      setTimingAnalysis({
        node,
        ...timingInfo,
        inputCount: inputEdges.length,
        outputCount: outputEdges.length,
        criticalPath: calculateCriticalPath(nodeId),
        setupHoldViolations: checkSetupHoldViolations(nodeId),
      });
    }
  };

  // Calculate critical path through node
  const calculateCriticalPath = (nodeId) => {
    const path = [];
    let currentId = nodeId;
    
    while (currentId) {
      path.push(currentId);
      const outgoingEdges = edges.filter(e => e.source === currentId);
      if (outgoingEdges.length === 0) break;
      
      // Find the node with longest delay
      let nextId = null;
      let maxDelay = 0;
      
      outgoingEdges.forEach(edge => {
        const timingInfo = getTimingInfo(edge.target);
        if (timingInfo && timingInfo.propagationDelay > maxDelay) {
          maxDelay = timingInfo.propagationDelay;
          nextId = edge.target;
        }
      });
      
      currentId = nextId;
    }
    
    return path;
  };

  // Check for setup/hold time violations
  const checkSetupHoldViolations = (nodeId) => {
    const violations = [];
    const node = nodes.find(n => n.id === nodeId);
    const timingInfo = getTimingInfo(nodeId);
    
    if (!node || !timingInfo) return violations;
    
    const inputEdges = edges.filter(e => e.target === nodeId);
    
    inputEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const sourceTimingInfo = getTimingInfo(edge.source);
      
      if (sourceNode && sourceTimingInfo) {
        // Check setup time violation
        if (timingInfo.setupTime && sourceTimingInfo.propagationDelay > timingInfo.setupTime) {
          violations.push({
            type: 'setup',
            source: edge.source,
            target: nodeId,
            message: `Setup time violation: ${sourceTimingInfo.propagationDelay}ns > ${timingInfo.setupTime}ns`
          });
        }
        
        // Check hold time violation
        if (timingInfo.holdTime && sourceTimingInfo.propagationDelay < timingInfo.holdTime) {
          violations.push({
            type: 'hold',
            source: edge.source,
            target: nodeId,
            message: `Hold time violation: ${sourceTimingInfo.propagationDelay}ns < ${timingInfo.holdTime}ns`
          });
        }
      }
    });
    
    return violations;
  };

  // Run timing simulation
  const runTimingSimulation = () => {
    setIsSimulating(true);
    
    const simulationInterval = setInterval(() => {
      simulateSequentialStep(0.1 * simulationSpeed);
    }, 100);
    
    setTimeout(() => {
      clearInterval(simulationInterval);
      setIsSimulating(false);
    }, 5000);
  };

  // Step simulation
  const stepSimulation = () => {
    simulateSequentialStep(0.1);
  };

  // Reset simulation
  const resetSimulation = () => {
    const { clearCircuit } = useCircuitStore.getState();
    clearCircuit();
  };

  return (
    <div
      style={{
        backgroundColor: currentTheme.surface,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: `0 2px 8px ${currentTheme.shadow.sm}`,
        overflow: 'auto',
        maxHeight: '200px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '16px' }}>⏱️</span>
          <span style={{ fontSize: '14px' }}>Timing Simulation</span>
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: '6px',
          }}
        >
          <button
            onClick={toggleTimingMode}
            style={{
              padding: '6px 12px',
              backgroundColor: timingEnabled ? currentTheme.primary : 'transparent',
              color: timingEnabled ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${timingEnabled ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {timingEnabled ? 'Timing ON' : 'Timing OFF'}
          </button>
        </div>
      </div>

      {/* Simulation Mode Selection */}
      <div
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Simulation Mode
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {simulationModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSimulationMode(mode.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: simulationMode === mode.id ? currentTheme.primary : 'transparent',
                color: simulationMode === mode.id ? 'white' : currentTheme.text.secondary,
                border: `1px solid ${simulationMode === mode.id ? currentTheme.primary : currentTheme.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <div style={{ fontWeight: '600' }}>{mode.label}</div>
              <div style={{ fontSize: '9px', opacity: 0.8 }}>{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={runTimingSimulation}
          disabled={isSimulating}
          style={{
            padding: '12px',
            backgroundColor: isSimulating ? currentTheme.text.secondary : currentTheme.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid white',
            borderRadius: '50%',
            animation: isSimulating ? 'spin 1s linear infinite' : 'none',
          }}></span>
          <span>{isSimulating ? 'Simulating...' : 'Run'}</span>
        </button>

        <button
          onClick={stepSimulation}
          disabled={isSimulating}
          style={{
            padding: '12px',
            backgroundColor: currentTheme.secondary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Step
        </button>

        <button
          onClick={resetSimulation}
          style={{
            padding: '12px',
            backgroundColor: currentTheme.error,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Simulation Speed
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
              minWidth: '80px',
            }}
          >
            {simulationSpeed}x
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
            style={{
              flex: 1,
              height: '4px',
            }}
          />
        </div>
      </div>

      {/* Current Time Display */}
      <div
        style={{
          backgroundColor: `${currentTheme.background}50`,
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${currentTheme.border}`,
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            marginBottom: '4px',
          }}
        >
          Simulation Time
        </div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: currentTheme.primary,
            fontFamily: 'monospace',
          }}
        >
          {currentTime.toFixed(2)} ns
        </div>
      </div>

      {/* Node Selection for Analysis */}
      <div
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Analyze Node Timing
        </div>
        <select
          value={selectedNode}
          onChange={(e) => {
            setSelectedNode(e.target.value);
            analyzeNodeTiming(e.target.value);
          }}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: currentTheme.text.primary,
          }}
        >
          <option value="">Select a node...</option>
          {nodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.data.label} ({node.id.substring(0, 8)})
            </option>
          ))}
        </select>
      </div>

      {/* Timing Analysis Results */}
      {timingAnalysis && (
        <div
          style={{
            backgroundColor: `${currentTheme.background}50`,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Timing Analysis: {timingAnalysis.node.data.label}
          </div>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '11px',
            }}
          >
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>Propagation Delay</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {timingAnalysis.propagationDelay}ns
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>Setup Time</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {timingAnalysis.setupTime}ns
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>Hold Time</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {timingAnalysis.holdTime}ns
              </div>
            </div>
            
            <div>
              <div style={{ color: currentTheme.text.secondary, marginBottom: '4px' }}>I/O Count</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.primary }}>
                {timingAnalysis.inputCount}→{timingAnalysis.outputCount}
              </div>
            </div>
          </div>

          {/* Violations */}
          {timingAnalysis.setupHoldViolations.length > 0 && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: `${currentTheme.error}15`,
                borderRadius: '6px',
                border: `1px solid ${currentTheme.error}`,
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.error,
                  marginBottom: '8px',
                }}
              >
                Timing Violations
              </div>
              {timingAnalysis.setupHoldViolations.map((violation, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '10px',
                    color: currentTheme.error,
                    marginBottom: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {violation.message}
                </div>
              ))}
            </div>
          )}

          {/* Critical Path */}
          {timingAnalysis.criticalPath && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: `${currentTheme.accent}15`,
                borderRadius: '6px',
                border: `1px solid ${currentTheme.accent}`,
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: currentTheme.accent,
                  marginBottom: '8px',
                }}
              >
                Critical Path
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.primary,
                  fontFamily: 'monospace',
                }}
              >
                {timingAnalysis.criticalPath.map(nodeId => {
                  const node = nodes.find(n => n.id === nodeId);
                  return node ? node.data.label : nodeId;
                }).join(' → ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimingSimulationPanel;
