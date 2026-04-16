import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedCircuitOptimizer = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, setNodes, setEdges } = useCircuitStore();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);

  // Circuit optimization algorithms
  const optimizeCircuit = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const optimizations = [];
      
      // 1. Remove redundant gates
      const redundantGates = findRedundantGates();
      if (redundantGates.length > 0) {
        optimizations.push({
          type: 'redundant_gates',
          description: `Remove ${redundantGates.length} redundant gates`,
          impact: 'Reduces complexity and power consumption',
          savings: redundantGates.length * 2, // Estimated power savings
        });
      }
      
      // 2. Optimize gate placement
      const placementOptimizations = optimizeGatePlacement();
      if (placementOptimizations.length > 0) {
        optimizations.push({
          type: 'placement_optimization',
          description: `Optimize placement of ${placementOptimizations.length} gates`,
          impact: 'Reduces wire length and signal delay',
          savings: placementOptimizations.length * 0.5,
        });
      }
      
      // 3. Merge parallel paths
      const parallelOptimizations = mergeParallelPaths();
      if (parallelOptimizations.length > 0) {
        optimizations.push({
          type: 'parallel_optimization',
          description: `Merge ${parallelOptimizations.length} parallel paths`,
          impact: 'Improves circuit speed and reduces gate count',
          savings: parallelOptimizations.length * 3,
        });
      }
      
      // 4. Optimize for minimal power consumption
      const powerOptimizations = optimizeForPower();
      if (powerOptimizations.length > 0) {
        optimizations.push({
          type: 'power_optimization',
          description: `Replace ${powerOptimizations.length} gates with low-power alternatives`,
          impact: 'Reduces overall power consumption',
          savings: powerOptimizations.length * 4,
        });
      }
      
      setOptimizationResults({
        totalOptimizations: optimizations.length,
        optimizations,
        estimatedPowerSaving: optimizations.reduce((total, opt) => total + (opt.savings || 0), 0),
        estimatedGateReduction: optimizations.reduce((total, opt) => total + (opt.gateReduction || 0), 0),
      });
      
      setIsOptimizing(false);
    }, 2000);
  };

  const findRedundantGates = () => {
    const redundant = [];
    
    // Find NOT gates in series (NOT(NOT(A)) = A)
    nodes.forEach(node => {
      if (node.data.label === 'NOT') {
        const inputEdge = edges.find(e => e.target === node.id);
        if (inputEdge) {
          const inputNode = nodes.find(n => n.id === inputEdge.source);
          if (inputNode && inputNode.data.label === 'NOT') {
            redundant.push({
              type: 'double_negation',
              nodes: [inputNode.id, node.id],
              suggestion: 'Remove double negation',
            });
          }
        }
      }
    });
    
    // Find gates with identical inputs (AND(A,A) = A
    nodes.forEach(node => {
      if (['AND', 'OR', 'XOR'].includes(node.data.label)) {
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputNodes = inputEdges.map(e => nodes.find(n => n.id === e.source));
        
        if (inputNodes.length === 2 && inputNodes[0] && inputNodes[1]) {
          if (inputNodes[0].id === inputNodes[1].id) {
            redundant.push({
              type: 'identical_inputs',
              nodes: [inputNodes[0].id, node.id],
              suggestion: 'Connect to different input nodes',
            });
          }
        }
      }
    });
    
    return redundant;
  };

  const optimizeGatePlacement = () => {
    const optimizations = [];
    
    // Sort nodes by x position for better routing
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    
    // Find crossing wires
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      for (let j = i + 1; j < sortedNodes.length; j++) {
        if (wiresCross(sortedNodes[i], sortedNodes[j])) {
          optimizations.push({
            type: 'wire_crossing',
            nodes: [sortedNodes[i].id, sortedNodes[j].id],
            suggestion: 'Reorder to eliminate wire crossing',
          });
        }
      }
    }
    
    return optimizations;
  };

  const mergeParallelPaths = () => {
    const optimizations = [];
    
    // Find parallel AND gates that can be combined
    nodes.forEach(node => {
      if (node.data.label === 'AND') {
        const inputEdges = edges.filter(e => e.target === node.id);
        if (inputEdges.length === 2) {
          const inputNodes = inputEdges.map(e => nodes.find(n => n.id === e.source));
          
          // Check if both inputs come from same source
          if (inputNodes[0] && inputNodes[1] && inputNodes[0].id === inputNodes[1].id) {
            optimizations.push({
              type: 'parallel_and',
              nodes: [inputNodes[0].id, node.id],
              suggestion: 'Merge parallel AND gates',
            });
          }
        }
      }
    });
    
    return optimizations;
  };

  const optimizeForPower = () => {
    const optimizations = [];
    
    // Replace high-power gates with alternatives
    nodes.forEach(node => {
      if (node.data.label === 'XOR') {
        // XOR can be replaced with 4 NAND gates (lower power)
        optimizations.push({
          type: 'xor_replacement',
          nodes: [node.id],
          suggestion: 'Replace XOR with NAND implementation',
        });
      }
      
      if (node.data.label === 'OR') {
        // OR gates with many inputs can be optimized
        const inputEdges = edges.filter(e => e.target === node.id);
        if (inputEdges.length > 3) {
          optimizations.push({
            type: 'large_or_gate',
            nodes: [node.id],
            suggestion: 'Break into smaller OR gates',
          });
        }
      }
    });
    
    return optimizations;
  };

  const wiresCross = (node1, node2) => {
    // Simple wire crossing detection
    const edges1 = edges.filter(e => e.source === node1.id || e.target === node1.id);
    const edges2 = edges.filter(e => e.source === node2.id || e.target === node2.id);
    
    // Check if any wires cross (simplified)
    return edges1.some(edge1 => 
      edges2.some(edge2 => {
        // Simplified crossing check
        return (edge1.source === edge2.source && edge1.target === edge2.target) ||
               (edge1.source === edge2.target && edge1.target === edge2.source);
      })
    );
  };

  const applyOptimizations = () => {
    if (!optimizationResults) return;
    
    const newNodes = [...nodes];
    const newEdges = [...edges];
    
    optimizationResults.optimizations.forEach(opt => {
      switch (opt.type) {
        case 'redundant_gates':
          opt.nodes.forEach(nodeId => {
            const index = newNodes.findIndex(n => n.id === nodeId);
            if (index !== -1) {
              newNodes.splice(index, 1);
            }
          });
          break;
          
        case 'placement_optimization':
          // Apply placement optimizations
          opt.nodes.forEach(nodeId => {
            const node = newNodes.find(n => n.id === nodeId);
            if (node) {
              // Adjust position for better routing
              const inputEdges = newEdges.filter(e => e.target === nodeId);
              if (inputEdges.length > 0) {
                const avgX = inputEdges.reduce((sum, e) => sum + newEdges.find(n => n.id === e.source).position.x, 0) / inputEdges.length;
                node.position.x = avgX;
              }
            }
          });
          break;
        }
      }
    };
    
    setNodes(newNodes);
    setEdges(newEdges);
    setOptimizationResults(null);
  };

  return (
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: currentTheme.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚡</span>
          Circuit Optimizer
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={optimizeCircuit}
            disabled={isOptimizing}
            style={{
              padding: '8px 16px',
              backgroundColor: isOptimizing ? currentTheme.text.secondary : currentTheme.primary,
              color: isOptimizing ? currentTheme.text.secondary : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isOptimizing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              border: '2px solid white',
              borderRadius: '50%',
              animation: isOptimizing ? 'spin 1s linear infinite' : 'none',
            }}></span>
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Circuit'}</span>
          </button>
          
          {optimizationResults && (
            <button
              onClick={applyOptimizations}
              style={{
                padding: '8px 16px',
                backgroundColor: currentTheme.success,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
            >
              Apply Optimizations
            </button>
          )}
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
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
            Optimization Results
          </div>
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Total Optimizations
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {optimizationResults.totalOptimizations}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Power Savings
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.success }}>
                -{optimizationResults.estimatedPowerSaving.toFixed(1)} mW
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: currentTheme.text.secondary, marginBottom: '4px' }}>
                Gate Reduction
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                -{optimizationResults.estimatedGateReduction}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: currentTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Found Optimizations:
            </div>
            {optimizationResults.optimizations.map((opt, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  backgroundColor: `${currentTheme.background}50`,
                  borderRadius: '6px',
                  border: `1px solid ${currentTheme.border}`,
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  {opt.type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.primary,
                    lineHeight: '1.4',
                  }}
                >
                  {opt.description}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.success,
                    marginTop: '4px',
                  }}
                >
                  Savings: {opt.savings || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCircuitOptimizer;
