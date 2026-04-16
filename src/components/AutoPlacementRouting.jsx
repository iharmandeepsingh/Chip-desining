import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AutoPlacementRouting = () => {
  const { currentTheme } = useTheme;
  const { nodes, edges, setNodes, setEdges } = useCircuitStore();
  
  const [placementData, setPlacementData] = useState({
    placedNodes: [],
    routingGrid: [],
    congestionMap: new Map(),
    totalWirelength: 0,
    placementScore: 0
  });
  
  const [routingOptions, setRoutingOptions] = useState({
    algorithm: 'force_directed',
    gridResolution: 10,
    maxIterations: 100,
    temperature: 1.0,
    coolingRate: 0.95,
    wireWeight: 1.0,
    overlapWeight: 10.0,
    centerWeight: 0.1
  });

  // Placement algorithms
  const placementAlgorithms = [
    {
      id: 'force_directed',
      name: 'Force-Directed',
      description: 'Physics-based placement using spring forces',
      icon: 'FD',
      complexity: 'O(n²)'
    },
    {
      id: 'simulated_annealing',
      name: 'Simulated Annealing',
      description: 'Stochastic optimization with temperature cooling',
      icon: 'SA',
      complexity: 'O(n³)'
    },
    {
      id: 'genetic_algorithm',
      name: 'Genetic Algorithm',
      description: 'Evolutionary optimization approach',
      icon: 'GA',
      complexity: 'O(n²)'
    },
    {
      id: 'min_cut',
      name: 'Min-Cut',
      description: 'Partition-based placement algorithm',
      icon: 'MC',
      complexity: 'O(n log n)'
    }
  ];

  // Routing algorithms
  const routingAlgorithms = [
    {
      id: 'maze_routing',
      name: 'Maze Routing',
      description: 'Lee\'s algorithm for path finding',
      icon: 'MZ'
    },
    {
      id: 'line_search',
      name: 'Line Search',
      description: 'Fast line-based routing',
      icon: 'LS'
    },
    {
      id: 'channel_routing',
      name: 'Channel Routing',
      description: 'Channel-based routing approach',
      icon: 'CR'
    },
    {
      id: 'detailed_routing',
      name: 'Detailed Routing',
      description: 'Design rule aware routing',
      icon: 'DR'
    }
  ];

  // Force-directed placement
  const forceDirectedPlacement = () => {
    const placedNodes = [...nodes];
    const forces = new Map();
    
    // Initialize positions
    placedNodes.forEach(node => {
      if (!node.position) {
        node.position = {
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100
        };
      }
      forces.set(node.id, { x: 0, y: 0 });
    });
    
    // Run force-directed algorithm
    for (let iteration = 0; iteration < routingOptions.maxIterations; iteration++) {
      // Reset forces
      placedNodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 });
      });
      
      // Calculate repulsive forces (node-node)
      placedNodes.forEach((node1, i) => {
        placedNodes.forEach((node2, j) => {
          if (i !== j) {
            const dx = node1.position.x - node2.position.x;
            const dy = node1.position.y - node2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.1) {
              const force = routingOptions.overlapWeight / (distance * distance);
              const fx = force * dx / distance;
              const fy = force * dy / distance;
              
              const currentForce = forces.get(node1.id);
              forces.set(node1.id, {
                x: currentForce.x + fx,
                y: currentForce.y + fy
              });
            }
          }
        });
      });
      
      // Calculate attractive forces (edge connections)
      edges.forEach(edge => {
        const sourceNode = placedNodes.find(n => n.id === edge.source);
        const targetNode = placedNodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const idealDistance = 100; // Ideal distance between connected nodes
          const force = routingOptions.wireWeight * (distance - idealDistance);
          
          if (distance > 0.1) {
            const fx = force * dx / distance;
            const fy = force * dy / distance;
            
            // Apply equal and opposite forces
            const sourceForce = forces.get(sourceNode.id);
            const targetForce = forces.get(targetNode.id);
            
            forces.set(sourceNode.id, {
              x: sourceForce.x + fx,
              y: sourceForce.y + fy
            });
            
            forces.set(targetForce.id, {
              x: targetForce.x - fx,
              y: targetForce.y - fy
            });
          }
        }
      });
      
      // Calculate centering force
      placedNodes.forEach(node => {
        const centerX = 400;
        const centerY = 300;
        const dx = centerX - node.position.x;
        const dy = centerY - node.position.y;
        
        const currentForce = forces.get(node.id);
        forces.set(node.id, {
          x: currentForce.x + dx * routingOptions.centerWeight,
          y: currentForce.y + dy * routingOptions.centerWeight
        });
      });
      
      // Update positions
      placedNodes.forEach(node => {
        const force = forces.get(node.id);
        const damping = 0.1;
        
        node.position.x += force.x * damping;
        node.position.y += force.y * damping;
        
        // Keep nodes within bounds
        node.position.x = Math.max(50, Math.min(750, node.position.x));
        node.position.y = Math.max(50, Math.min(550, node.position.y));
      });
    }
    
    return placedNodes;
  };

  // Simulated annealing placement
  const simulatedAnnealingPlacement = () => {
    const placedNodes = [...nodes];
    let temperature = routingOptions.temperature;
    let bestScore = calculatePlacementScore(placedNodes);
    let bestPlacement = JSON.parse(JSON.stringify(placedNodes));
    
    // Initialize random positions
    placedNodes.forEach(node => {
      node.position = {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100
      };
    });
    
    while (temperature > 0.01) {
      // Random move
      const nodeIndex = Math.floor(Math.random() * placedNodes.length);
      const node = placedNodes[nodeIndex];
      const oldPosition = { ...node.position };
      
      // Random displacement
      node.position.x += (Math.random() - 0.5) * 100;
      node.position.y += (Math.random() - 0.5) * 100;
      
      // Keep within bounds
      node.position.x = Math.max(50, Math.min(750, node.position.x));
      node.position.y = Math.max(50, Math.min(550, node.position.y));
      
      // Calculate new score
      const newScore = calculatePlacementScore(placedNodes);
      const delta = newScore - bestScore;
      
      // Accept or reject move
      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        if (newScore < bestScore) {
          bestScore = newScore;
          bestPlacement = JSON.parse(JSON.stringify(placedNodes));
        }
      } else {
        // Reject move
        node.position = oldPosition;
      }
      
      // Cool down
      temperature *= routingOptions.coolingRate;
    }
    
    return bestPlacement;
  };

  // Calculate placement score
  const calculatePlacementScore = (nodeList) => {
    let score = 0;
    
    // Wire length penalty
    edges.forEach(edge => {
      const sourceNode = nodeList.find(n => n.id === edge.source);
      const targetNode = nodeList.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        score += distance * routingOptions.wireWeight;
      }
    });
    
    // Overlap penalty
    nodeList.forEach((node1, i) => {
      nodeList.forEach((node2, j) => {
        if (i !== j) {
          const dx = node1.position.x - node2.position.x;
          const dy = node1.position.y - node2.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            score += (50 - distance) * routingOptions.overlapWeight;
          }
        }
      });
    });
    
    // Centering penalty
    const centerX = 400;
    const centerY = 300;
    nodeList.forEach(node => {
      const dx = node.position.x - centerX;
      const dy = node.position.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      score += distance * routingOptions.centerWeight;
    });
    
    return score;
  };

  // Maze routing
  const mazeRouting = (placedNodes) => {
    const routingGrid = createRoutingGrid();
    const routedEdges = [];
    
    edges.forEach(edge => {
      const sourceNode = placedNodes.find(n => n.id === edge.source);
      const targetNode = placedNodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const path = findMazePath(
          routingGrid,
          sourceNode.position,
          targetNode.position
        );
        
        if (path) {
          routedEdges.push({
            ...edge,
            path,
            routed: true
          });
        }
      }
    });
    
    return routedEdges;
  };

  // Create routing grid
  const createRoutingGrid = () => {
    const grid = [];
    const gridSize = routingOptions.gridResolution;
    
    for (let y = 0; y < 60; y++) {
      const row = [];
      for (let x = 0; x < 80; x++) {
        row.push({
          blocked: false,
          congestion: 0,
          wire: null
        });
      }
      grid.push(row);
    }
    
    return grid;
  };

  // Find path using maze routing (Lee's algorithm)
  const findMazePath = (grid, start, end) => {
    const gridSize = routingOptions.gridResolution;
    const startX = Math.floor(start.x / gridSize);
    const startY = Math.floor(start.y / gridSize);
    const endX = Math.floor(end.x / gridSize);
    const endY = Math.floor(end.y / gridSize);
    
    const queue = [{ x: startX, y: startY, path: [] }];
    const visited = new Set();
    
    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (x === endX && y === endY) {
        return [...path, { x, y }];
      }
      
      // Check neighbors
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        if (neighbor.x >= 0 && neighbor.x < 80 && 
            neighbor.y >= 0 && neighbor.y < 60 &&
            !visited.has(`${neighbor.x},${neighbor.y}`)) {
          
          queue.push({
            x: neighbor.x,
            y: neighbor.y,
            path: [...path, { x, y }]
          });
        }
      }
    }
    
    return null;
  };

  // Line search routing
  const lineSearchRouting = (placedNodes) => {
    const routedEdges = [];
    
    edges.forEach(edge => {
      const sourceNode = placedNodes.find(n => n.id === edge.source);
      const targetNode = placedNodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const path = findLineSearchPath(sourceNode.position, targetNode.position);
        
        routedEdges.push({
          ...edge,
          path,
          routed: true
        });
      }
    });
    
    return routedEdges;
  };

  // Find path using line search
  const findLineSearchPath = (start, end) => {
    // Simple Manhattan routing
    const path = [];
    
    // Horizontal then vertical
    const midX = end.x;
    const midY = start.y;
    
    path.push({ x: start.x, y: start.y });
    path.push({ x: midX, y: midY });
    path.push({ x: end.x, y: end.y });
    
    return path;
  };

  // Run placement
  const runPlacement = () => {
    let placedNodes;
    
    switch (routingOptions.algorithm) {
      case 'force_directed':
        placedNodes = forceDirectedPlacement();
        break;
      case 'simulated_annealing':
        placedNodes = simulatedAnnealingPlacement();
        break;
      default:
        placedNodes = forceDirectedPlacement();
    }
    
    setPlacementData(prev => ({
      ...prev,
      placedNodes,
      placementScore: calculatePlacementScore(placedNodes)
    }));
    
    return placedNodes;
  };

  // Run routing
  const runRouting = () => {
    const { placedNodes } = placementData;
    
    if (placedNodes.length === 0) return [];
    
    const routedEdges = mazeRouting(placedNodes);
    const totalWirelength = calculateTotalWirelength(routedEdges);
    
    setPlacementData(prev => ({
      ...prev,
      routingGrid: createRoutingGrid(),
      totalWirelength
    }));
    
    return routedEdges;
  };

  // Calculate total wire length
  const calculateTotalWirelength = (routedEdges) => {
    let totalLength = 0;
    
    routedEdges.forEach(edge => {
      if (edge.path && edge.path.length > 1) {
        for (let i = 0; i < edge.path.length - 1; i++) {
          const dx = edge.path[i + 1].x - edge.path[i].x;
          const dy = edge.path[i + 1].y - edge.path[i].y;
          totalLength += Math.sqrt(dx * dx + dy * dy);
        }
      }
    });
    
    return totalLength;
  };

  // Apply placement and routing
  const applyPlacementRouting = () => {
    const placedNodes = runPlacement();
    const routedEdges = runRouting();
    
    // Update node positions
    setNodes(placedNodes);
    
    // Update edge paths (would need to be stored in edge data)
    console.log('Applied placement and routing:', {
      nodes: placedNodes.length,
      edges: routedEdges.length,
      wirelength: placementData.totalWirelength
    });
  };

  // Update layout when circuit changes
  useEffect(() => {
    runPlacement();
  }, [nodes, edges]);

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
          <span style={{ fontSize: '20px' }}>APR</span>
          Auto Placement & Routing
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={runPlacement}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Run Placement
          </button>

          <button
            onClick={runRouting}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Run Routing
          </button>

          <button
            onClick={applyPlacementRouting}
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
            Apply Layout
          </button>
        </div>
      </div>

      {/* Placement & Routing Content */}
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
        {/* Algorithm Selection */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Placement Algorithm
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {placementAlgorithms.map(algorithm => (
              <div
                key={algorithm.id}
                style={{
                  backgroundColor: routingOptions.algorithm === algorithm.id ? `${currentTheme.primary}15` : currentTheme.surface,
                  border: routingOptions.algorithm === algorithm.id ? `2px solid ${currentTheme.primary}` : `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setRoutingOptions(prev => ({ ...prev, algorithm: algorithm.id }))}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: currentTheme.primary,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    {algorithm.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {algorithm.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {algorithm.description}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: currentTheme.text.secondary,
                    marginTop: '4px',
                  }}
                >
                  {algorithm.complexity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routing Options */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Routing Algorithm
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {routingAlgorithms.map(algorithm => (
              <div
                key={algorithm.id}
                style={{
                  backgroundColor: currentTheme.surface,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: currentTheme.secondary,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    {algorithm.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {algorithm.name}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {algorithm.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Parameters
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
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Max Iterations
                </label>
                <input
                  type="number"
                  value={routingOptions.maxIterations}
                  onChange={(e) => setRoutingOptions(prev => ({ ...prev, maxIterations: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Grid Resolution
                </label>
                <input
                  type="number"
                  value={routingOptions.gridResolution}
                  onChange={(e) => setRoutingOptions(prev => ({ ...prev, gridResolution: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Wire Weight
                </label>
                <input
                  type="number"
                  value={routingOptions.wireWeight}
                  onChange={(e) => setRoutingOptions(prev => ({ ...prev, wireWeight: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Overlap Weight
                </label>
                <input
                  type="number"
                  value={routingOptions.overlapWeight}
                  onChange={(e) => setRoutingOptions(prev => ({ ...prev, overlapWeight: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '4px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Results
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
                Placement Score
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {placementData.placementScore.toFixed(0)}
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
                Total Wirelength
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {placementData.totalWirelength.toFixed(0)}
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
                Placed Nodes
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {placementData.placedNodes.length}
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
                Grid Size
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: currentTheme.primary,
                }}
              >
                {routingOptions.gridResolution}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoPlacementRouting;
