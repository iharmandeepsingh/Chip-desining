import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const GraphSimulationEngine = () => {
  const { currentTheme } = useTheme;
  const { nodes, edges, updateNode } = useCircuitStore();
  
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    currentTime: 0,
    stepSize: 0.1,
    maxTime: 100,
    mode: 'functional'
  });
  
  const [graphData, setGraphData] = useState({
    adjacencyList: new Map(),
    topologicalOrder: [],
    levels: new Map(),
    criticalPath: [],
    fanOut: new Map(),
    fanIn: new Map()
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalNodes: 0,
    totalEdges: 0,
    maxDepth: 0,
    avgFanOut: 0,
    cycles: [],
    isolatedNodes: []
  });
  
  const animationRef = useRef(null);
  const simulationRef = useRef(null);

  // Build graph from circuit
  const buildGraph = () => {
    const adjacencyList = new Map();
    const fanIn = new Map();
    const fanOut = new Map();
    
    // Initialize adjacency list
    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      fanIn.set(node.id, 0);
      fanOut.set(node.id, 0);
    });
    
    // Build edges
    edges.forEach(edge => {
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source).push(edge.target);
        fanOut.set(edge.source, (fanOut.get(edge.source) || 0) + 1);
        fanIn.set(edge.target, (fanIn.get(edge.target) || 0) + 1);
      }
    });
    
    return { adjacencyList, fanIn, fanOut };
  };

  // Topological sort using Kahn's algorithm
  const topologicalSort = (adjacencyList) => {
    const inDegree = new Map();
    const queue = [];
    const result = [];
    
    // Calculate in-degrees
    adjacencyList.forEach((neighbors, node) => {
      inDegree.set(node, 0);
    });
    
    adjacencyList.forEach((neighbors, node) => {
      neighbors.forEach(neighbor => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      });
    });
    
    // Find nodes with no incoming edges
    inDegree.forEach((degree, node) => {
      if (degree === 0) {
        queue.push(node);
      }
    });
    
    // Process nodes
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);
      
      const neighbors = adjacencyList.get(current) || [];
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    // Check for cycles
    if (result.length !== adjacencyList.size) {
      throw new Error('Graph contains cycles');
    }
    
    return result;
  };

  // Detect cycles using DFS
  const detectCycles = (adjacencyList) => {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    const hasCycle = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat([node]));
        }
        return true;
      }
      
      if (visited.has(node)) return false;
      
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor, [...path, node])) {
          return true;
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    adjacencyList.forEach((_, node) => {
      if (!visited.has(node)) {
        hasCycle(node);
      }
    });
    
    return cycles;
  };

  // Calculate graph levels (longest path from inputs)
  const calculateLevels = (adjacencyList, topologicalOrder) => {
    const levels = new Map();
    
    topologicalOrder.forEach(node => {
      const predecessors = getPredecessors(adjacencyList, node);
      if (predecessors.length === 0) {
        levels.set(node, 0); // Input nodes
      } else {
        const maxPredLevel = Math.max(...predecessors.map(pred => levels.get(pred) || 0));
        levels.set(node, maxPredLevel + 1);
      }
    });
    
    return levels;
  };

  // Get predecessors of a node
  const getPredecessors = (adjacencyList, node) => {
    const predecessors = [];
    adjacencyList.forEach((neighbors, source) => {
      if (neighbors.includes(node)) {
        predecessors.push(source);
      }
    });
    return predecessors;
  };

  // Find critical path
  const findCriticalPath = (adjacencyList, topologicalOrder, levels) => {
    const maxLevel = Math.max(...Array.from(levels.values()));
    const criticalNodes = Array.from(levels.entries())
      .filter(([_, level]) => level === maxLevel)
      .map(([node, _]) => node);
    
    // Trace back from critical nodes to inputs
    const criticalPaths = criticalNodes.map(node => {
      const path = [node];
      let current = node;
      
      while (levels.get(current) > 0) {
        const predecessors = getPredecessors(adjacencyList, current);
        const maxPredLevel = Math.max(...predecessors.map(pred => levels.get(pred) || 0));
        const nextPredecessor = predecessors.find(pred => levels.get(pred) === maxPredLevel);
        
        if (nextPredecessor) {
          path.unshift(nextPredecessor);
          current = nextPredecessor;
        } else {
          break;
        }
      }
      
      return path;
    });
    
    return criticalPaths[0] || []; // Return first critical path
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = (adjacencyList, topologicalOrder, levels, cycles) => {
    const maxDepth = Math.max(...Array.from(levels.values()));
    const avgFanOut = Array.from(adjacencyList.values())
      .reduce((sum, neighbors) => sum + neighbors.length, 0) / adjacencyList.size;
    
    const isolatedNodes = [];
    adjacencyList.forEach((neighbors, node) => {
      if (neighbors.length === 0 && getPredecessors(adjacencyList, node).length === 0) {
        isolatedNodes.push(node);
      }
    });
    
    return {
      totalNodes: adjacencyList.size,
      totalEdges: Array.from(adjacencyList.values()).reduce((sum, neighbors) => sum + neighbors.length, 0),
      maxDepth,
      avgFanOut,
      cycles,
      isolatedNodes
    };
  };

  // Update graph analysis
  const updateGraphAnalysis = () => {
    try {
      const { adjacencyList, fanIn, fanOut } = buildGraph();
      const topologicalOrder = topologicalSort(adjacencyList);
      const levels = calculateLevels(adjacencyList, topologicalOrder);
      const criticalPath = findCriticalPath(adjacencyList, topologicalOrder, levels);
      const cycles = detectCycles(adjacencyList);
      const metrics = calculatePerformanceMetrics(adjacencyList, topologicalOrder, levels, cycles);
      
      setGraphData({
        adjacencyList,
        topologicalOrder,
        levels,
        criticalPath,
        fanOut,
        fanIn
      });
      
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Graph analysis error:', error);
    }
  };

  // Run simulation step
  const runSimulationStep = () => {
    const { adjacencyList, topologicalOrder } = graphData;
    
    if (!adjacencyList || topologicalOrder.length === 0) return;
    
    // Process nodes in topological order
    topologicalOrder.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      // Calculate node output based on inputs
      const inputs = getNodeInputs(nodeId, adjacencyList);
      const output = calculateNodeOutput(node, inputs);
      
      // Update node state
      updateNode(nodeId, {
        data: { ...node.data, value: output }
      });
    });
  };

  // Get node inputs
  const getNodeInputs = (nodeId, adjacencyList) => {
    const inputs = [];
    const predecessors = getPredecessors(adjacencyList, nodeId);
    
    predecessors.forEach(predId => {
      const predNode = nodes.find(n => n.id === predId);
      if (predNode) {
        inputs.push(predNode.data.value || false);
      }
    });
    
    return inputs;
  };

  // Calculate node output
  const calculateNodeOutput = (node, inputs) => {
    switch (node.data.label) {
      case 'INPUT':
        return node.data.value || false;
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

  // Run continuous simulation
  const runContinuousSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
    
    simulationRef.current = setInterval(() => {
      setSimulationState(prev => {
        const newTime = prev.currentTime + prev.stepSize;
        
        if (newTime >= prev.maxTime) {
          clearInterval(simulationRef.current);
          return { ...prev, isRunning: false, currentTime: prev.maxTime };
        }
        
        return { ...prev, currentTime: newTime };
      });
      
      runSimulationStep();
    }, 100);
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
      runContinuousSimulation();
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
    
    // Reset all nodes to initial state
    nodes.forEach(node => {
      if (node.data.label === 'INPUT') {
        updateNode(node.id, { data: { ...node.data, value: false } });
      } else {
        updateNode(node.id, { data: { ...node.data, value: false } });
      }
    });
  };

  // Step simulation
  const stepSimulation = () => {
    runSimulationStep();
    setSimulationState(prev => ({
      ...prev,
      currentTime: prev.currentTime + prev.stepSize
    }));
  };

  // Update graph when circuit changes
  useEffect(() => {
    updateGraphAnalysis();
  }, [nodes, edges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
          <span style={{ fontSize: '20px' }}>Graph</span>
          Graph-Based Simulation Engine
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
            {simulationState.isRunning ? 'Stop' : 'Start'}
          </button>

          <button
            onClick={stepSimulation}
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
            Step
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: '16px',
            }}
          >
            <label
              style={{
                fontSize: '11px',
                color: currentTheme.text.secondary,
              }}
            >
              Step:
            </label>
            <input
              type="number"
              value={simulationState.stepSize}
              onChange={(e) => setSimulationState(prev => ({ ...prev, stepSize: parseFloat(e.target.value) }))}
              step="0.1"
              min="0.1"
              max="10"
              style={{
                width: '60px',
                padding: '4px',
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '11px',
                color: currentTheme.text.primary,
              }}
            />
          </div>

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

      {/* Graph Analysis Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Graph Metrics */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Graph Analysis
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
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
                Nodes
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {performanceMetrics.totalNodes}
              </div>
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
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
                Edges
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {performanceMetrics.totalEdges}
              </div>
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
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
                Max Depth
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {performanceMetrics.maxDepth}
              </div>
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
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
                Avg Fan-Out
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {performanceMetrics.avgFanOut.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Topological Order */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Topological Order
          </div>

          <div
            style={{
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '120px',
              overflow: 'auto',
            }}
          >
            {graphData.topologicalOrder.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {graphData.topologicalOrder.map((nodeId, index) => {
                  const node = nodes.find(n => n.id === nodeId);
                  const level = graphData.levels.get(nodeId) || 0;
                  const isCritical = graphData.criticalPath.includes(nodeId);
                  
                  return (
                    <div
                      key={nodeId}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: isCritical ? `${currentTheme.primary}20` : `${currentTheme.background}50`,
                        border: isCritical ? `1px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: currentTheme.text.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{index + 1}.</span>
                      <span>{node?.data.label || 'Unknown'}</span>
                      <span
                        style={{
                          fontSize: '8px',
                          color: currentTheme.text.secondary,
                        }}
                      >
                        L{level}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  textAlign: 'center',
                }}
              >
                No topological order available
              </div>
            )}
          </div>
        </div>

        {/* Critical Path */}
        {graphData.criticalPath.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Critical Path
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                {graphData.criticalPath.map((nodeId, index) => {
                  const node = nodes.find(n => n.id === nodeId);
                  
                  return (
                    <React.Fragment key={nodeId}>
                      <div
                        style={{
                          padding: '4px 8px',
                          backgroundColor: `${currentTheme.primary}20`,
                          border: `1px solid ${currentTheme.primary}`,
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: currentTheme.primary,
                          fontWeight: '600',
                        }}
                      >
                        {node?.data.label || 'Unknown'}
                      </div>
                      {index < graphData.criticalPath.length - 1 && (
                        <span
                          style={{
                            fontSize: '12px',
                            color: currentTheme.text.secondary,
                          }}
                        >
                          {'->'}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              
              <div
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.secondary,
                  marginTop: '8px',
                }}
              >
                Path length: {graphData.criticalPath.length} nodes
              </div>
            </div>
          </div>
        )}

        {/* Issues */}
        {(performanceMetrics.cycles.length > 0 || performanceMetrics.isolatedNodes.length > 0) && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Graph Issues
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              {performanceMetrics.cycles.length > 0 && (
                <div
                  style={{
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: currentTheme.error,
                      marginBottom: '4px',
                    }}
                  >
                    Cycles Detected ({performanceMetrics.cycles.length})
                  </div>
                  {performanceMetrics.cycles.map((cycle, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                        marginBottom: '2px',
                      }}
                    >
                      Cycle {index + 1}: {cycle.map(nodeId => {
                        const node = nodes.find(n => n.id === nodeId);
                        return node?.data.label || nodeId;
                      }).join(' -> ')}
                    </div>
                  ))}
                </div>
              )}

              {performanceMetrics.isolatedNodes.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: currentTheme.warning,
                      marginBottom: '4px',
                    }}
                  >
                    Isolated Nodes ({performanceMetrics.isolatedNodes.length})
                  </div>
                  {performanceMetrics.isolatedNodes.map(nodeId => {
                    const node = nodes.find(n => n.id === nodeId);
                    return (
                      <div
                        key={nodeId}
                        style={{
                          fontSize: '10px',
                          color: currentTheme.text.secondary,
                        }}
                      >
                        {node?.data.label || nodeId}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphSimulationEngine;
