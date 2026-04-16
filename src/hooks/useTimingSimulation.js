import { useCallback, useEffect, useRef, useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const useTimingSimulation = () => {
  const { nodes, edges, simulateWithEngine } = useCircuitStore();
  
  // Timing simulation state
  const [isTimingMode, setIsTimingMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0); // 1x speed
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timingData, setTimingData] = useState(new Map());
  const [isPaused, setIsPaused] = useState(false);
  const [propagationDelays, setPropagationDelays] = useState(new Map());
  
  // Animation frame reference
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Default propagation delays for different gate types (in milliseconds)
  const defaultDelays = {
    'INPUT': 0,
    'OUTPUT': 0,
    'AND': 10,
    'OR': 10,
    'NOT': 5,
    'D_FLIP_FLOP': 20,
    'JK_FLIP_FLOP': 25,
    'T_FLIP_FLOP': 20,
    'CLOCK': 0,
    'COUNTER': 15,
    'MULTIPLEXER': 12,
    'DECODER': 8
  };

  // Initialize timing data for nodes
  const initializeTimingData = useCallback(() => {
    const newTimingData = new Map();
    
    nodes.forEach(node => {
      const gateType = node.data.label;
      const delay = propagationDelays.get(gateType) || defaultDelays[gateType] || 10;
      
      newTimingData.set(node.id, {
        delay: delay,
        lastUpdateTime: 0,
        propagationStartTime: 0,
        isPropagating: false,
        scheduledUpdate: null,
        value: node.data.value || false,
        inputValues: {},
        outputValue: false
      });
    });
    
    setTimingData(newTimingData);
  }, [nodes, propagationDelays]);

  // Calculate propagation timing for a circuit
  const calculatePropagationTiming = useCallback(() => {
    const timingAnalysis = [];
    const totalDelay = 0;
    
    // Find all paths from inputs to outputs
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    inputNodes.forEach(inputNode => {
      const paths = findAllPaths(inputNode.id, outputNodes.map(n => n.id), edges, nodes);
      
      paths.forEach(path => {
        let pathDelay = 0;
        path.forEach(nodeId => {
          const nodeDelay = propagationDelays.get(nodes.find(n => n.id === nodeId)?.data?.label) || 
                           defaultDelays[nodes.find(n => n.id === nodeId)?.data?.label] || 10;
          pathDelay += nodeDelay;
        });
        
        timingAnalysis.push({
          from: inputNode.id,
          to: path[path.length - 1],
          path: path,
          delay: pathDelay,
          gates: path.length
        });
        
        totalDelay = Math.max(totalDelay, pathDelay);
      });
    });
    
    return {
      timingAnalysis,
      totalDelay,
      averageDelay: timingAnalysis.length > 0 ? timingAnalysis.reduce((sum, path) => sum + path.delay, 0) / timingAnalysis.length : 0,
      criticalPath: timingAnalysis.length > 0 ? timingAnalysis.reduce((max, path) => path.delay > max.delay ? path : max) : null
    };
  }, [nodes, edges, propagationDelays]);

  // Find all paths between two nodes
  const findAllPaths = (startId, endIds, edges, nodes, visited = new Set()) => {
    const paths = [];
    
    const dfs = (currentId, currentPath) => {
      if (endIds.includes(currentId)) {
        paths.push([...currentPath, currentId]);
        return;
      }
      
      if (visited.has(currentId)) {
        return;
      }
      
      visited.add(currentId);
      
      const outgoingEdges = edges.filter(e => e.source === currentId);
      for (const edge of outgoingEdges) {
        dfs(edge.target, [...currentPath, currentId]);
      }
      
      visited.delete(currentId);
    };
    
    dfs(startId, [startId]);
    return paths;
  };

  // Start timing simulation
  const startTimingSimulation = useCallback(() => {
    setIsTimingMode(true);
    setCurrentTimestamp(0);
    initializeTimingData();
    
    // Run initial propagation
    simulateWithEngine({ engine: 'timing' });
  }, [simulateWithEngine, initializeTimingData]);

  // Stop timing simulation
  const stopTimingSimulation = useCallback(() => {
    setIsTimingMode(false);
    setIsPaused(false);
    
    // Cancel any pending animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear timing data
    setTimingData(new Map());
  }, []);

  // Pause/resume timing simulation
  const pauseTimingSimulation = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  // Update simulation speed
  const updateSimulationSpeed = useCallback((newSpeed) => {
    setSimulationSpeed(Math.max(0.1, Math.min(5.0, newSpeed)));
  }, []);

  // Set custom propagation delay for a gate type
  const setPropagationDelay = useCallback((gateType, delay) => {
    setPropagationDelays(prev => {
      const newDelays = new Map(prev);
      newDelays.set(gateType, Math.max(0, delay));
      return newDelays;
    });
  }, []);

  // Timing simulation loop
  const timingSimulationLoop = useCallback((timestamp) => {
    if (!isTimingMode || isPaused) {
      return;
    }

    const deltaTime = timestamp - lastFrameTimeRef.current;
    const scaledDelta = deltaTime * simulationSpeed;
    const newTimestamp = currentTimestamp + scaledDelta;
    
    // Update timing data and propagate signals
    const updatedTimingData = new Map();
    let hasUpdates = false;
    
    timingData.forEach((nodeTiming, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Check if this node should be updated
      const shouldUpdate = newTimestamp >= nodeTiming.propagationStartTime + nodeTiming.delay;
      
      if (shouldUpdate) {
        hasUpdates = true;
        
        // Calculate new value based on inputs
        const inputs = edges
          .filter(e => e.target === nodeId)
          .map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const sourceTiming = timingData.get(edge.source);
            return sourceTiming ? sourceTiming.outputValue : false;
          });
        
        let newValue = nodeTiming.value;
        const gateType = node.data.label;
        
        // Sequential circuit state management
        if (['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'T_FLIP_FLOP'].includes(gateType)) {
          const clockInput = inputs.find((input, index) => 
            edges.find(e => e.target === nodeId && e.sourceHandle === `CLK`)
          );
          const clockValue = clockInput || false;
          
          if (gateType === 'D_FLIP_FLOP') {
            const D = inputs[0] || false;
            newValue = clockValue ? D : nodeTiming.value; // Edge-triggered
          } else if (gateType === 'JK_FLIP_FLOP') {
            const J = inputs[0] || false;
            const K = inputs[1] || false;
            const Q_prev = nodeTiming.value;
            
            if (clockValue) {
              if (!J && !K) newValue = false;        // Reset
              else if (!J && K) newValue = Q_prev;      // No change
              else if (J && !K) newValue = true;         // Set
              else if (!J && K) newValue = !Q_prev;     // Reset
              else newValue = !Q_prev;                  // Toggle
            }
          } else {
            newValue = nodeTiming.value; // Hold
          }
        } else if (gateType === 'COUNTER') {
          const clockInput = inputs.find(input => 
            edges.find(e => e.target === nodeId && e.sourceHandle === 'CLK')
          );
          const clockValue = clockInput || false;
          const resetInput = inputs.find(input => 
            edges.find(e => e.target === nodeId && e.sourceHandle === 'RESET')
          );
          const resetValue = resetInput || false;
          
          if (resetValue) {
            newValue = { count: 0 };
          } else if (clockValue && !nodeTiming.lastUpdateTime) {
            // Rising edge detection
            newValue = { count: ((nodeTiming.value?.count || 0) + 1) % (node.data.bits || 4) };
          }
        } else if (gateType === 'CLOCK') {
          const frequency = node.data.frequency || 1;
          const phase = node.data.phase || 0;
          const period = 1000 / frequency; // Period in ms
          const time = newTimestamp / 1000; // Convert to seconds
          const currentPhase = (time + phase) % 1;
          
          newValue = currentPhase < 0.5;
        }
        
        // Store output value for next stage
        const outputValue = newValue.count !== undefined ? newValue.count : 
                          newValue.Q !== undefined ? newValue.Q : newValue;
        
        updatedTimingData.set(nodeId, {
          ...nodeTiming,
          lastUpdateTime: newTimestamp,
          propagationStartTime: newTimestamp,
          value: newValue,
          outputValue: outputValue,
          inputValues: inputs.reduce((acc, input, index) => {
            acc[`input_${index}`] = input;
            return acc;
          }, {})
        });
      } else {
        // Combinational logic
        const gateType = node.data.label;
        const computeFunction = getCombinationalFunction(gateType);
        
        if (computeFunction) {
          newValue = computeFunction(inputs);
        }
        
        updatedTimingData.set(nodeId, {
          ...nodeTiming,
          lastUpdateTime: newTimestamp,
          value: newValue,
          outputValue: newValue,
          inputValues: inputs.reduce((acc, input, index) => {
            acc[`input_${index}`] = input;
            return acc;
          }, {})
        });
      }
    });
    
    if (hasUpdates) {
      setTimingData(updatedTimingData);
      setCurrentTimestamp(newTimestamp);
    }
    
    lastFrameTimeRef.current = timestamp;
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(timingSimulationLoop);
  }, [isTimingMode, isPaused, simulationSpeed, currentTimestamp, timingData, nodes, edges, simulateWithEngine]);

  // Get combinatorial logic function
  const getCombinationalFunction = (gateType) => {
    switch (gateType) {
      case 'AND':
        return (inputs) => inputs.length >= 2 ? inputs.every(Boolean) : false;
      case 'OR':
        return (inputs) => inputs.some(Boolean);
      case 'NOT':
        return (inputs) => inputs.length === 1 ? !inputs[0] : false;
      case 'XOR':
        return (inputs) => inputs.length === 2 ? inputs[0] !== inputs[1] : false;
      case 'NAND':
        return (inputs) => inputs.length >= 2 ? !inputs.every(Boolean) : true;
      case 'NOR':
        return (inputs) => inputs.length >= 2 ? !inputs.some(Boolean) : true;
      case 'XNOR':
        return (inputs) => inputs.length === 2 ? inputs[0] === inputs[1] : true;
      default:
        return null;
    }
  };

  // Get timing statistics
  const getTimingStatistics = useCallback(() => {
    const stats = {
      totalNodes: nodes.length,
      sequentialNodes: nodes.filter(n => 
        ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'T_FLIP_FLOP', 'CLOCK', 'COUNTER'].includes(n.data.label)
      ).length,
      combinationalNodes: nodes.filter(n => 
        !['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'T_FLIP_FLOP', 'CLOCK', 'COUNTER'].includes(n.data.label)
      ).length,
      totalDelay: 0,
      averageDelay: 0,
      criticalPathDelay: 0
    };
    
    if (isTimingMode) {
      const timing = calculatePropagationTiming();
      stats.totalDelay = timing.totalDelay;
      stats.averageDelay = timing.averageDelay;
      stats.criticalPathDelay = timing.criticalPathDelay ? timing.criticalPathDelay.delay : 0;
    }
    
    return stats;
  }, [isTimingMode, nodes, calculatePropagationTiming]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  return {
    // Timing simulation state
    isTimingMode,
    isPaused,
    simulationSpeed,
    currentTimestamp,
    timingData,
    propagationDelays,
    
    // Timing simulation controls
    startTimingSimulation,
    stopTimingSimulation,
    pauseTimingSimulation,
    updateSimulationSpeed,
    setPropagationDelay,
    
    // Timing analysis
    calculatePropagationTiming,
    getTimingStatistics,
    
    // Timing data access
    getNodeTiming: (nodeId) => timingData.get(nodeId),
    getAllTimingData: () => Array.from(timingData.entries()),
  };
};

export default useTimingSimulation;
