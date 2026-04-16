import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const PerformanceProfiler = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [selectedMetric, setSelectedMetric] = useState('render_time');
  const [showOptimizations, setShowOptimizations] = useState(false);
  
  const profilingRef = useRef(null);
  const startTimeRef = useRef(null);
  const frameCountRef = useRef(0);

  // Performance metrics to track
  const metrics = [
    {
      id: 'render_time',
      name: 'Render Time',
      description: 'Time to render circuit',
      unit: 'ms',
      target: 16.67, // 60 FPS
      warning: 33.33, // 30 FPS
      critical: 100   // 10 FPS
    },
    {
      id: 'simulation_time',
      name: 'Simulation Time',
      description: 'Time to simulate circuit',
      unit: 'ms',
      target: 10,
      warning: 50,
      critical: 100
    },
    {
      id: 'memory_usage',
      name: 'Memory Usage',
      description: 'Memory consumed by circuit',
      unit: 'MB',
      target: 50,
      warning: 100,
      critical: 200
    },
    {
      id: 'node_count',
      name: 'Node Count',
      description: 'Number of circuit nodes',
      unit: 'count',
      target: 100,
      warning: 500,
      critical: 1000
    },
    {
      id: 'edge_count',
      name: 'Edge Count',
      description: 'Number of connections',
      unit: 'count',
      target: 200,
      warning: 1000,
      critical: 2000
    },
    {
      id: 'complexity_score',
      name: 'Complexity Score',
      description: 'Overall circuit complexity',
      unit: 'score',
      target: 50,
      warning: 100,
      critical: 200
    }
  ];

  // Optimization suggestions
  const optimizationSuggestions = [
    {
      id: 'reduce_nodes',
      name: 'Reduce Node Count',
      description: 'Merge redundant gates and remove unused components',
      impact: 'high',
      difficulty: 'medium',
      estimatedImprovement: '20-40%'
    },
    {
      id: 'optimize_connections',
      name: 'Optimize Connections',
      description: 'Reduce wire crossings and shorten connection paths',
      impact: 'medium',
      difficulty: 'easy',
      estimatedImprovement: '10-20%'
    },
    {
      id: 'use_virtualization',
      name: 'Enable Virtualization',
      description: 'Only render visible portions of large circuits',
      impact: 'high',
      difficulty: 'hard',
      estimatedImprovement: '50-80%'
    },
    {
      id: 'batch_simulation',
      name: 'Batch Simulation',
      description: 'Group simulation operations for better performance',
      impact: 'medium',
      difficulty: 'medium',
      estimatedImprovement: '15-30%'
    },
    {
      id: 'cache_results',
      name: 'Cache Computation Results',
      description: 'Cache expensive calculations to avoid recomputation',
      impact: 'medium',
      difficulty: 'easy',
      estimatedImprovement: '10-25%'
    },
    {
      id: 'lazy_loading',
      name: 'Implement Lazy Loading',
      description: 'Load components and data only when needed',
      impact: 'high',
      difficulty: 'medium',
      estimatedImprovement: '30-50%'
    }
  ];

  // Start performance profiling
  const startProfiling = () => {
    setIsProfiling(true);
    startTimeRef.current = performance.now();
    frameCountRef.current = 0;
    
    // Start monitoring
    profilingRef.current = setInterval(() => {
      frameCountRef.current++;
      
      // Collect performance data
      const currentTime = performance.now();
      const deltaTime = currentTime - startTimeRef.current;
      
      const fps = frameCountRef.current / (deltaTime / 1000);
      const renderTime = 1000 / fps;
      
      // Estimate memory usage
      const nodeSize = JSON.stringify(nodes).length;
      const edgeSize = JSON.stringify(edges).length;
      const estimatedMemory = (nodeSize + edgeSize) / (1024 * 1024); // Convert to MB
      
      // Calculate complexity score
      const complexity = calculateComplexity();
      
      const newMetrics = {
        render_time: renderTime,
        simulation_time: estimateSimulationTime(),
        memory_usage: estimatedMemory,
        node_count: nodes.length,
        edge_count: edges.length,
        complexity_score: complexity,
        fps: fps,
        timestamp: currentTime
      };
      
      setPerformanceMetrics(prev => ({
        ...prev,
        [currentTime]: newMetrics
      }));
      
      // Update current metrics
      setProfileData(newMetrics);
    }, 100);
  };

  // Stop profiling
  const stopProfiling = () => {
    setIsProfiling(false);
    if (profilingRef.current) {
      clearInterval(profilingRef.current);
      profilingRef.current = null;
    }
  };

  // Calculate circuit complexity
  const calculateComplexity = () => {
    let complexity = 0;
    
    // Base complexity from node count
    complexity += nodes.length * 1;
    
    // Add complexity for edges
    complexity += edges.length * 0.5;
    
    // Add complexity for sequential components
    const sequentialNodes = nodes.filter(n => 
      ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER', 'REGISTER'].includes(n.data.label)
    );
    complexity += sequentialNodes.length * 2;
    
    // Add complexity for feedback loops
    const feedbackLoops = detectFeedbackLoops();
    complexity += feedbackLoops.length * 5;
    
    // Add complexity for fan-out
    const maxFanOut = Math.max(...edges.map(edge => 
      edges.filter(e => e.source === edge.source).length
    ));
    complexity += maxFanOut * 0.1;
    
    return Math.round(complexity);
  };

  // Detect feedback loops
  const detectFeedbackLoops = () => {
    const loops = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (nodeId, path = []) => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          loops.push(path.slice(cycleStart));
        }
        return true;
      }
      
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target, [...path, nodeId])) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        hasCycle(node.id);
      }
    });
    
    return loops;
  };

  // Estimate simulation time
  const estimateSimulationTime = () => {
    // Base time per node
    const baseTimePerNode = 0.1; // ms
    
    // Additional time for sequential components
    const sequentialMultiplier = 2.5;
    const sequentialNodes = nodes.filter(n => 
      ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER', 'REGISTER'].includes(n.data.label)
    ).length;
    
    // Additional time for complex gates
    const complexMultiplier = 1.5;
    const complexNodes = nodes.filter(n => 
      ['XOR', 'XNOR', 'MULTIPLEXER', 'DECODER'].includes(n.data.label)
    ).length;
    
    // Calculate total time
    const baseTime = nodes.length * baseTimePerNode;
    const sequentialTime = sequentialNodes * baseTimePerNode * (sequentialMultiplier - 1);
    const complexTime = complexNodes * baseTimePerNode * (complexMultiplier - 1);
    
    return baseTime + sequentialTime + complexTime;
  };

  // Apply optimization
  const applyOptimization = (optimizationId) => {
    const optimization = optimizationSuggestions.find(o => o.id === optimizationId);
    if (!optimization) return;
    
    switch (optimizationId) {
      case 'reduce_nodes':
        // Remove redundant nodes
        const redundantNodes = findRedundantNodes();
        if (redundantNodes.length > 0) {
          console.log(`Removing ${redundantNodes.length} redundant nodes`);
        }
        break;
        
      case 'optimize_connections':
        // Optimize wire routing
        optimizeWireRouting();
        break;
        
      case 'cache_results':
        // Enable caching (would need to be implemented in store)
        console.log('Enabling result caching');
        break;
        
      default:
        console.log(`Applying optimization: ${optimization.name}`);
    }
  };

  // Find redundant nodes
  const findRedundantNodes = => {
    const redundant = [];
    
    // Find duplicate AND gates with same inputs
    nodes.forEach(node => {
      if (node.data.label === 'AND') {
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputNodes = inputEdges.map(e => nodes.find(n => n.id === e.source));
        
        if (inputNodes.length === 2) {
          // Check if there's another AND gate with same inputs
          const duplicate = nodes.find(other => 
            other.id !== node.id && 
            other.data.label === 'AND' &&
            hasSameInputs(other.id, node.id)
          );
          
          if (duplicate) {
            redundant.push(node.id);
          }
        }
      }
    });
    
    return redundant;
  };

  // Check if two nodes have same inputs
  const hasSameInputs = (nodeId1, nodeId2) => {
    const inputs1 = edges.filter(e => e.target === nodeId1).map(e => e.source).sort();
    const inputs2 = edges.filter(e => e.target === nodeId2).map(e => e.source).sort();
    
    return inputs1.length === inputs2.length && 
           inputs1.every((input, index) => input === inputs2[index]);
  };

  // Optimize wire routing
  const optimizeWireRouting = () => {
    // This would implement wire routing optimization
    console.log('Optimizing wire routing to reduce crossings');
  };

  // Get metric status
  const getMetricStatus = (metricId, value) => {
    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return 'normal';
    
    if (value >= metric.critical) return 'critical';
    if (value >= metric.warning) return 'warning';
    if (value >= metric.target) return 'good';
    return 'excellent';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      excellent: currentTheme.success,
      good: currentTheme.success,
      warning: currentTheme.warning,
      critical: currentTheme.error,
      normal: currentTheme.text.secondary
    };
    return colors[status] || colors.normal;
  };

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
          <span style={{ fontSize: '20px' }}>Perf</span>
          Performance Profiler
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={isProfiling ? stopProfiling : startProfiling}
            style={{
              padding: '6px 12px',
              backgroundColor: isProfiling ? currentTheme.error : currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {isProfiling ? 'Stop Profiling' : 'Start Profiling'}
          </button>

          <button
            onClick={() => setShowOptimizations(!showOptimizations)}
            style={{
              padding: '6px 12px',
              backgroundColor: showOptimizations ? currentTheme.primary : 'transparent',
              color: showOptimizations ? 'white' : currentTheme.text.secondary,
              border: `1px solid ${showOptimizations ? currentTheme.primary : currentTheme.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Optimizations
          </button>
        </div>
      </div>

      {/* Performance Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {/* Current Metrics */}
        {profileData && (
          <div
            style={{
              marginBottom: '20px',
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
              Current Performance
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {metrics.map(metric => {
                const value = profileData[metric.id] || 0;
                const status = getMetricStatus(metric.id, value);
                const statusColor = getStatusColor(status);
                
                return (
                  <div
                    key={metric.id}
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
                      {metric.name}
                    </div>
                    
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: statusColor,
                        marginBottom: '4px',
                      }}
                    >
                      {value.toFixed(metric.id === 'memory_usage' ? 2 : 1)} {metric.unit}
                    </div>
                    
                    <div
                      style={{
                        fontSize: '9px',
                        color: currentTheme.text.secondary,
                      }}
                    >
                      Target: {metric.target} {metric.unit}
                    </div>
                    
                    <div
                      style={{
                        marginTop: '8px',
                        height: '4px',
                        backgroundColor: currentTheme.border,
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (value / metric.target) * 100)}%`,
                          height: '100%',
                          backgroundColor: statusColor,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {showOptimizations && (
          <div
            style={{
              marginBottom: '20px',
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
              Optimization Suggestions
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
              }}
            >
              {optimizationSuggestions.map(optimization => (
                <div
                  key={optimization.id}
                  style={{
                    backgroundColor: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                      }}
                    >
                      {optimization.name}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        backgroundColor: optimization.impact === 'high' ? `${currentTheme.error}15` : 
                                       optimization.impact === 'medium' ? `${currentTheme.warning}15` : 
                                       `${currentTheme.success}15`,
                        color: optimization.impact === 'high' ? currentTheme.error : 
                                 optimization.impact === 'medium' ? currentTheme.warning : 
                                 currentTheme.success,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {optimization.impact}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                      marginBottom: '8px',
                      lineHeight: '1.4',
                    }}
                  >
                    {optimization.description}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9px',
                        color: currentTheme.text.secondary,
                      }}
                    >
                      Difficulty: {optimization.difficulty} | 
                      Improvement: {optimization.estimatedImprovement}
                    </div>

                    <button
                      onClick={() => applyOptimization(optimization.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: currentTheme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: '500',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance History */}
        {Object.keys(performanceMetrics).length > 0 && (
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
              Performance History
            </div>

            <div
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
                marginBottom: '8px',
              }}
            >
              {Object.keys(performanceMetrics).length} data points collected
            </div>

            <div
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
              }}
            >
              Profiling {isProfiling ? 'in progress...' : 'completed'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceProfiler;
