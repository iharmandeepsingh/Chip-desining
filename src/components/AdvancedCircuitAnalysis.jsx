import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedCircuitAnalysis = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate circuit metrics
  const metrics = useMemo(() => {
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    const logicGates = nodes.filter(n => 
      ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(n.data.label)
    );
    const sequentialGates = nodes.filter(n => 
      ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'CLOCK', 'COUNTER'].includes(n.data.label)
    );

    // Calculate circuit depth and complexity
    const calculateDepth = () => {
      const visited = new Set();
      const depthMap = new Map();
      
      inputNodes.forEach(node => {
        depthMap.set(node.id, 0);
      });
      
      const calculateNodeDepth = (nodeId) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        let maxDepth = depthMap.get(nodeId) || 0;
        
        outgoingEdges.forEach(edge => {
          const childDepth = calculateNodeDepth(edge.target);
          maxDepth = Math.max(maxDepth, childDepth + 1);
        });
        
        return maxDepth;
      };
      
      inputNodes.forEach(node => calculateNodeDepth(node.id));
      
      return Math.max(...Array.from(depthMap.values()));
    };

    // Calculate critical path
    const calculateCriticalPath = () => {
      const paths = [];
      
      inputNodes.forEach(input => {
        const findPaths = (nodeId, currentPath = []) => {
          const currentNode = nodes.find(n => n.id === nodeId);
          if (!currentNode) return [];
          
          const newPath = [...currentPath, nodeId];
          
          if (currentNode.data.label === 'OUTPUT') {
            return [newPath];
          }
          
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          const allPaths = [];
          
          outgoingEdges.forEach(edge => {
            const subPaths = findPaths(edge.target, newPath);
            subPaths.forEach(subPath => {
              allPaths.push([...subPath]);
            });
          });
          
          return allPaths;
        };
        
        const allPaths = findPaths(input.id);
        paths.push(...allPaths);
      });
      
      const longestPath = paths.reduce((longest, path) => 
        path.length > longest.length ? path : longest, []
      );
      
      return longestPath;
    };

    // Calculate power consumption
    const calculatePowerConsumption = () => {
      const gatePower = {
        'INPUT': 0,
        'OUTPUT': 0,
        'AND': 2,
        'OR': 2,
        'NOT': 1,
        'XOR': 3,
        'NAND': 1,
        'NOR': 1,
        'XNOR': 3,
        'D_FLIP_FLOP': 8,
        'JK_FLIP_FLOP': 10,
        'CLOCK': 2,
        'COUNTER': 15,
      };
      
      return nodes.reduce((total, node) => {
        return total + (gatePower[node.data.label] || 0);
      }, 0);
    };

    const depth = calculateDepth();
    const criticalPath = calculateCriticalPath();
    const powerConsumption = calculatePowerConsumption();
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      inputNodes: inputNodes.length,
      outputNodes: outputNodes.length,
      logicGates: logicGates.length,
      sequentialGates: sequentialGates.length,
      depth,
      criticalPathLength: criticalPath.length,
      criticalPath,
      powerConsumption,
      complexity: depth > 5 ? 'High' : depth > 3 ? 'Medium' : 'Low',
      fanOut: edges.reduce((max, edge) => {
        const sourceConnections = edges.filter(e => e.source === edge.source).length;
        return Math.max(max, sourceConnections);
      }, 0),
    };
  }, [nodes, edges]);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
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
          <span style={{ fontSize: '20px' }}>📊</span>
          Circuit Analysis
        </div>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          style={{
            padding: '8px 16px',
            backgroundColor: isAnalyzing ? currentTheme.text.secondary : currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
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
            animation: isAnalyzing ? 'spin 1s linear infinite' : 'none',
          }}></span>
          <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}
      >
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
              fontSize: '12px',
              fontWeight: '600',
              color: currentTheme.text.secondary,
              marginBottom: '12px',
            }}
          >
            Circuit Statistics
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Total Nodes
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {metrics.totalNodes}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Total Edges
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {metrics.totalEdges}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Circuit Depth
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {metrics.depth}
              </div>
            </div>
          </div>
        </div>

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
              fontSize: '12px',
              fontWeight: '600',
              color: currentTheme.text.secondary,
              marginBottom: '12px',
            }}
          >
            Performance Metrics
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Complexity
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: metrics.complexity === 'High' ? currentTheme.error : 
                          metrics.complexity === 'Medium' ? currentTheme.warning : currentTheme.success 
              }}>
                {metrics.complexity}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Power (mW)
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {metrics.powerConsumption}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: currentTheme.text.secondary }}>
                Max Fan-Out
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.primary }}>
                {metrics.fanOut}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Path Visualization */}
      {metrics.criticalPath.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: `${currentTheme.background}50`,
            borderRadius: '8px',
            padding: '16px',
            border: `1px solid ${currentTheme.border}`,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: currentTheme.text.secondary,
              marginBottom: '12px',
            }}
          >
            Critical Path Analysis
          </div>
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.primary,
              lineHeight: '1.6',
            }}
          >
            Critical path length: <span style={{ fontWeight: '600', color: currentTheme.primary }}>{metrics.criticalPathLength}</span> gates
          </div>
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: currentTheme.surface,
              borderRadius: '6px',
              fontSize: '10px',
              color: currentTheme.text.secondary,
            }}
          >
            {metrics.criticalPath.map((nodeId, index) => {
              const node = nodes.find(n => n.id === nodeId);
              return (
                <span key={nodeId}>
                  {node.data.label}
                  {index < metrics.criticalPath.length - 1 && <span style={{ margin: '0 4px' }}>→</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: currentTheme.surface,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: `0 8px 32px ${currentTheme.shadow}`,
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '16px',
              }}
            >
              Analyzing Circuit...
            </div>
            <div
              style={{
                width: '200px',
                height: '4px',
                backgroundColor: currentTheme.border,
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: currentTheme.primary,
                  animation: 'progress 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCircuitAnalysis;
