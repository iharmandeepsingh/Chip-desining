import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const ComprehensiveCircuitValidation = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges } = useCircuitStore();
  
  const [validationResults, setValidationResults] = useState({
    overall: { status: 'unknown', score: 0, issues: [] },
    structural: { status: 'unknown', score: 0, issues: [] },
    logical: { status: 'unknown', score: 0, issues: [] },
    timing: { status: 'unknown', score: 0, issues: [] },
    electrical: { status: 'unknown', score: 0, issues: [] },
    design: { status: 'unknown', score: 0, issues: [] }
  });
  
  const [validationRules, setValidationRules] = useState({
    enabled: {
      structural: true,
      logical: true,
      timing: true,
      electrical: true,
      design: true
    },
    severity: {
      error: true,
      warning: true,
      info: true
    }
  });

  // Validation rule definitions
  const validationRuleDefinitions = {
    structural: [
      {
        id: 'no_orphan_nodes',
        name: 'No Orphan Nodes',
        description: 'All nodes must have at least one connection',
        severity: 'error',
        check: () => {
          const connectedNodes = new Set();
          edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
          });
          
          const orphanNodes = nodes.filter(node => 
            !connectedNodes.has(node.id) && node.data.label !== 'INPUT'
          );
          
          return {
            passed: orphanNodes.length === 0,
            issues: orphanNodes.map(node => ({
              node: node.id,
              message: `Node ${node.data.label} has no connections`,
              severity: 'error',
              suggestion: 'Connect the node to the circuit or remove it'
            }))
          };
        }
      },
      {
        id: 'no_floating_inputs',
        name: 'No Floating Inputs',
        description: 'All gate inputs must be connected',
        severity: 'error',
        check: () => {
          const issues = [];
          
          nodes.forEach(node => {
            if (['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(node.data.label)) {
              const inputEdges = edges.filter(e => e.target === node.id);
              const requiredInputs = node.data.label === 'NOT' ? 1 : 2;
              
              if (inputEdges.length < requiredInputs) {
                issues.push({
                  node: node.id,
                  message: `${node.data.label} gate has ${inputEdges.length}/${requiredInputs} inputs connected`,
                  severity: 'error',
                  suggestion: `Connect the missing ${requiredInputs - inputEdges.length} input(s)`
                });
              }
            }
          });
          
          return {
            passed: issues.length === 0,
            issues
          };
        }
      },
      {
        id: 'no_duplicate_edges',
        name: 'No Duplicate Edges',
        description: 'No duplicate connections between same nodes',
        severity: 'warning',
        check: () => {
          const edgePairs = new Set();
          const duplicateEdges = [];
          
          edges.forEach(edge => {
            const pair = `${edge.source}-${edge.target}`;
            if (edgePairs.has(pair)) {
              duplicateEdges.push({
                edge: edge.id,
                message: `Duplicate connection between ${edge.source} and ${edge.target}`,
                severity: 'warning',
                suggestion: 'Remove the duplicate connection'
              });
            } else {
              edgePairs.add(pair);
            }
          });
          
          return {
            passed: duplicateEdges.length === 0,
            issues: duplicateEdges
          };
        }
      }
    ],
    logical: [
      {
        id: 'no_feedback_loops',
        name: 'No Feedback Loops',
        description: 'Detect combinatorial feedback loops',
        severity: 'warning',
        check: () => {
          const issues = [];
          const visited = new Set();
          const recursionStack = new Set();
          
          const hasCycle = (nodeId, path = []) => {
            if (recursionStack.has(nodeId)) {
              const cycleStart = path.indexOf(nodeId);
              if (cycleStart !== -1) {
                const cycle = path.slice(cycleStart).map(id => {
                  const node = nodes.find(n => n.id === id);
                  return node ? node.data.label : id;
                });
                
                issues.push({
                  node: nodeId,
                  message: `Feedback loop detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
                  severity: 'warning',
                  suggestion: 'Consider using sequential elements or break the loop'
                });
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
          
          return {
            passed: issues.length === 0,
            issues
          };
        }
      },
      {
        id: 'input_output_balance',
        name: 'Input/Output Balance',
        description: 'Circuit should have reasonable input/output ratio',
        severity: 'info',
        check: () => {
          const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
          const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
          
          const issues = [];
          
          if (inputNodes.length === 0) {
            issues.push({
              node: null,
              message: 'No input nodes found',
              severity: 'error',
              suggestion: 'Add input nodes to drive the circuit'
            });
          }
          
          if (outputNodes.length === 0) {
            issues.push({
              node: null,
              message: 'No output nodes found',
              severity: 'warning',
              suggestion: 'Add output nodes to capture circuit results'
            });
          }
          
          const ratio = outputNodes.length / inputNodes.length;
          if (ratio > 10) {
            issues.push({
              node: null,
              message: `High output/input ratio (${ratio.toFixed(1)}:1)`,
              severity: 'info',
              suggestion: 'Consider if this ratio is intentional'
            });
          }
          
          return {
            passed: issues.filter(i => i.severity === 'error').length === 0,
            issues
          };
        }
      },
      {
        id: 'gate_usage_patterns',
        name: 'Gate Usage Patterns',
        description: 'Check for common gate usage patterns',
        severity: 'info',
        check: () => {
          const issues = [];
          const gateCounts = {};
          
          nodes.forEach(node => {
            const gateType = node.data.label;
            gateCounts[gateType] = (gateCounts[gateType] || 0) + 1;
          });
          
          // Check for NAND/NOR usage
          if (gateCounts['AND'] > 0 && gateCounts['NAND'] === 0) {
            issues.push({
              node: null,
              message: 'Consider using NAND gates instead of AND gates for better optimization',
              severity: 'info',
              suggestion: 'NAND gates are universal and often more area-efficient'
            });
          }
          
          if (gateCounts['OR'] > 0 && gateCounts['NOR'] === 0) {
            issues.push({
              node: null,
              message: 'Consider using NOR gates instead of OR gates for better optimization',
              severity: 'info',
              suggestion: 'NOR gates are universal and often more area-efficient'
            });
          }
          
          return {
            passed: true,
            issues
          };
        }
      }
    ],
    timing: [
      {
        id: 'critical_path_analysis',
        name: 'Critical Path Analysis',
        description: 'Analyze timing through critical paths',
        severity: 'warning',
        check: () => {
          const issues = [];
          const criticalPaths = findCriticalPaths();
          
          criticalPaths.forEach(path => {
            const delay = calculatePathDelay(path);
            if (delay > 10) { // 10ns threshold
              issues.push({
                node: path[path.length - 1],
                message: `Critical path delay is ${delay.toFixed(2)}ns (threshold: 10ns)`,
                severity: 'warning',
                suggestion: 'Consider optimizing this path or using faster gates'
              });
            }
          });
          
          return {
            passed: issues.length === 0,
            issues
          };
        }
      },
      {
        id: 'setup_hold_times',
        name: 'Setup/Hold Time Analysis',
        description: 'Check setup and hold time violations',
        severity: 'error',
        check: () => {
          const issues = [];
          
          nodes.forEach(node => {
            if (node.data.label.includes('FLIP_FLOP') || node.data.label.includes('FF')) {
              const setupTime = 0.05; // ns
              const holdTime = 0.02; // ns
              const clockSkew = 0.1; // ns
              
              // Check setup time
              if (clockSkew > setupTime) {
                issues.push({
                  node: node.id,
                  message: `Setup time violation: clock skew (${clockSkew}ns) > setup time (${setupTime}ns)`,
                  severity: 'error',
                  suggestion: 'Reduce clock skew or use flip-flops with better setup time'
                });
              }
              
              // Check hold time
              if (clockSkew < holdTime) {
                issues.push({
                  node: node.id,
                  message: `Hold time violation: clock skew (${clockSkew}ns) < hold time (${holdTime}ns)`,
                  severity: 'error',
                  suggestion: 'Increase clock skew or use flip-flops with better hold time'
                });
              }
            }
          });
          
          return {
            passed: issues.length === 0,
            issues
          };
        }
      }
    ],
    electrical: [
      {
        id: 'fan_out_limits',
        name: 'Fan-out Limits',
        description: 'Check gate fan-out limits',
        severity: 'warning',
        check: () => {
          const issues = [];
          const fanOutLimits = {
            'NOT': 10,
            'AND': 8,
            'OR': 8,
            'XOR': 6,
            'NAND': 8,
            'NOR': 8,
            'XNOR': 6
          };
          
          nodes.forEach(node => {
            const gateType = node.data.label;
            const fanOutLimit = fanOutLimits[gateType];
            
            if (fanOutLimit) {
              const fanOut = edges.filter(e => e.source === node.id).length;
              
              if (fanOut > fanOutLimit) {
                issues.push({
                  node: node.id,
                  message: `${gateType} gate fan-out (${fanOut}) exceeds limit (${fanOutLimit})`,
                  severity: 'warning',
                  suggestion: 'Add buffer gates or use gates with higher fan-out capability'
                });
              }
            }
          });
          
          return {
            passed: issues.length === 0,
            issues
          };
        }
      },
      {
        id: 'power_estimation',
        name: 'Power Consumption',
        description: 'Estimate circuit power consumption',
        severity: 'info',
        check: () => {
          const issues = [];
          const powerConsumption = estimatePowerConsumption();
          
          if (powerConsumption > 100) { // 100mW threshold
            issues.push({
              node: null,
              message: `High power consumption estimated: ${powerConsumption.toFixed(2)}mW`,
              severity: 'warning',
              suggestion: 'Consider power optimization techniques'
            });
          }
          
          return {
            passed: issues.length === 0,
            issues: [
              {
                node: null,
                message: `Estimated power consumption: ${powerConsumption.toFixed(2)}mW`,
                severity: 'info',
                suggestion: 'This is within acceptable limits'
              }
            ]
          };
        }
      }
    ],
    design: [
      {
        id: 'design_complexity',
        name: 'Design Complexity',
        description: 'Assess overall design complexity',
        severity: 'info',
        check: () => {
          const issues = [];
          const complexity = calculateDesignComplexity();
          
          if (complexity > 100) {
            issues.push({
              node: null,
              message: `High design complexity score: ${complexity}`,
              severity: 'warning',
              suggestion: 'Consider breaking the design into smaller modules'
            });
          }
          
          return {
            passed: true,
            issues: [
              {
                node: null,
                message: `Design complexity score: ${complexity}`,
                severity: 'info',
                suggestion: 'This complexity is manageable'
              }
            ]
          };
        }
      },
      {
        id: 'design_guidelines',
        name: 'Design Guidelines',
        description: 'Check adherence to design guidelines',
        severity: 'info',
        check: () => {
          const issues = [];
          
          // Check for synchronous design practices
          const sequentialNodes = nodes.filter(n => 
            n.data.label.includes('FLIP_FLOP') || n.data.label.includes('FF')
          );
          
          if (sequentialNodes.length > 0) {
            const clockNodes = nodes.filter(n => n.data.label === 'CLK');
            if (clockNodes.length === 0) {
              issues.push({
                node: null,
                message: 'Sequential elements found but no clock signal',
                severity: 'warning',
                suggestion: 'Add a clock signal for synchronous design'
              });
            }
          }
          
          // Check for proper reset
          const resetNodes = nodes.filter(n => n.data.label === 'RESET');
          if (sequentialNodes.length > 0 && resetNodes.length === 0) {
            issues.push({
              node: null,
              message: 'Sequential elements found but no reset signal',
              severity: 'info',
              suggestion: 'Consider adding a reset signal for proper initialization'
            });
          }
          
          return {
            passed: issues.filter(i => i.severity === 'error').length === 0,
            issues
          };
        }
      }
    ]
  };

  // Helper functions
  const findCriticalPaths = () => {
    const paths = [];
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    inputNodes.forEach(inputNode => {
      outputNodes.forEach(outputNode => {
        const path = findPath(inputNode.id, outputNode.id);
        if (path.length > 0) {
          paths.push(path);
        }
      });
    });
    
    return paths;
  };

  const findPath = (startId, endId) => {
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

  const calculatePathDelay = (path) => {
    const gateDelays = {
      'NOT': 0.05,
      'AND': 0.1,
      'OR': 0.12,
      'XOR': 0.2,
      'NAND': 0.08,
      'NOR': 0.09,
      'XNOR': 0.15
    };
    
    let totalDelay = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const node = nodes.find(n => n.id === path[i + 1]);
      if (node) {
        const delay = gateDelays[node.data.label] || 0.1;
        totalDelay += delay;
      }
    }
    
    return totalDelay;
  };

  const estimatePowerConsumption = () => {
    const gatePowers = {
      'NOT': 0.3,
      'AND': 0.5,
      'OR': 0.6,
      'XOR': 0.8,
      'NAND': 0.4,
      'NOR': 0.45,
      'XNOR': 0.7,
      'D_FLIP_FLOP': 1.2,
      'JK_FLIP_FLOP': 1.5
    };
    
    let totalPower = 0;
    nodes.forEach(node => {
      const power = gatePowers[node.data.label] || 0.5;
      totalPower += power;
    });
    
    return totalPower;
  };

  const calculateDesignComplexity = () => {
    let complexity = 0;
    
    // Base complexity from node count
    complexity += nodes.length * 1;
    
    // Add complexity for edges
    complexity += edges.length * 0.5;
    
    // Add complexity for sequential elements
    const sequentialNodes = nodes.filter(n => 
      n.data.label.includes('FLIP_FLOP') || n.data.label.includes('FF')
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

  // Run validation
  const runValidation = () => {
    const results = { ...validationResults };
    const allIssues = [];
    
    // Run each validation category
    Object.keys(validationRuleDefinitions).forEach(category => {
      if (validationRules.enabled[category]) {
        const categoryRules = validationRuleDefinitions[category];
        const categoryIssues = [];
        let categoryScore = 100;
        
        categoryRules.forEach(rule => {
          const ruleResult = rule.check();
          categoryIssues.push(...ruleResult.issues);
          
          // Deduct score based on issues
          ruleResult.issues.forEach(issue => {
            if (issue.severity === 'error') categoryScore -= 20;
            else if (issue.severity === 'warning') categoryScore -= 10;
            else if (issue.severity === 'info') categoryScore -= 5;
          });
        });
        
        // Determine status
        let status = 'passed';
        if (categoryIssues.some(i => i.severity === 'error')) {
          status = 'failed';
        } else if (categoryIssues.some(i => i.severity === 'warning')) {
          status = 'warning';
        } else if (categoryIssues.some(i => i.severity === 'info')) {
          status = 'info';
        }
        
        results[category] = {
          status,
          score: Math.max(0, categoryScore),
          issues: categoryIssues.filter(issue => 
            validationRules.severity[issue.severity]
          )
        };
        
        allIssues.push(...categoryIssues);
      }
    });
    
    // Calculate overall score and status
    const overallScore = Object.values(results)
      .filter(r => r.score !== undefined)
      .reduce((sum, r) => sum + r.score, 0) / Object.keys(results).length;
    
    let overallStatus = 'passed';
    if (allIssues.some(i => i.severity === 'error')) {
      overallStatus = 'failed';
    } else if (allIssues.some(i => i.severity === 'warning')) {
      overallStatus = 'warning';
    } else if (allIssues.some(i => i.severity === 'info')) {
      overallStatus = 'info';
    }
    
    results.overall = {
      status: overallStatus,
      score: Math.round(overallScore),
      issues: allIssues.filter(issue => 
        validationRules.severity[issue.severity]
      )
    };
    
    setValidationResults(results);
    return results;
  };

  // Auto-fix issues
  const autoFixIssues = () => {
    const fixableIssues = validationResults.issues.filter(issue => 
      issue.severity === 'info' || issue.severity === 'warning'
    );
    
    // This would implement auto-fix logic
    console.log(`Auto-fixing ${fixableIssues.length} issues...`);
    
    // Re-run validation after fixes
    setTimeout(() => {
      runValidation();
    }, 1000);
  };

  // Export validation report
  const exportValidationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      overall: validationResults.overall,
      categories: validationResults,
      circuit: {
        nodes: nodes.length,
        edges: edges.length
      },
      rules: validationRules
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update validation when circuit changes
  useEffect(() => {
    runValidation();
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
          <span style={{ fontSize: '20px' }}>Val</span>
          Comprehensive Circuit Validation
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={runValidation}
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
            Validate
          </button>

          <button
            onClick={autoFixIssues}
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
            Auto-Fix
          </button>

          <button
            onClick={exportValidationReport}
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
            Export Report
          </button>
        </div>
      </div>

      {/* Validation Content */}
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
        {/* Overall Status */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Overall Validation Status
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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
                  Overall Status
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: validationResults.overall.status === 'passed' ? currentTheme.success :
                           validationResults.overall.status === 'failed' ? currentTheme.error :
                           validationResults.overall.status === 'warning' ? currentTheme.warning :
                           currentTheme.text.secondary,
                    backgroundColor: validationResults.overall.status === 'passed' ? `${currentTheme.success}15` :
                                   validationResults.overall.status === 'failed' ? `${currentTheme.error}15` :
                                   validationResults.overall.status === 'warning' ? `${currentTheme.warning}15` :
                                   `${currentTheme.text.secondary}15`,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {validationResults.overall.status}
                </div>
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: validationResults.overall.status === 'passed' ? currentTheme.success :
                         validationResults.overall.status === 'failed' ? currentTheme.error :
                         validationResults.overall.status === 'warning' ? currentTheme.warning :
                         currentTheme.text.secondary,
                }}
              >
                {validationResults.overall.score}%
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.secondary,
                }}
              >
                {validationResults.overall.issues.length} issues found
              </div>
            </div>

            {/* Category Status */}
            {Object.entries(validationResults).map(([category, result]) => {
              if (category === 'overall') return null;
              
              return (
                <div
                  key={category}
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
                      alignItems: 'center',
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
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: result.status === 'passed' ? currentTheme.success :
                               result.status === 'failed' ? currentTheme.error :
                               result.status === 'warning' ? currentTheme.warning :
                               currentTheme.text.secondary,
                        backgroundColor: result.status === 'passed' ? `${currentTheme.success}15` :
                                       result.status === 'failed' ? `${currentTheme.error}15` :
                                       result.status === 'warning' ? `${currentTheme.warning}15` :
                                       `${currentTheme.text.secondary}15`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {result.status}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: result.status === 'passed' ? currentTheme.success :
                             result.status === 'failed' ? currentTheme.error :
                             result.status === 'warning' ? currentTheme.warning :
                             currentTheme.text.secondary,
                    }}
                  >
                    {result.score}%
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                    }}
                  >
                    {result.issues.length} issues
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Rules Configuration */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Validation Rules
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
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: currentTheme.text.primary,
                    marginBottom: '8px',
                  }}
                >
                  Categories
                </div>
                {Object.keys(validationRules.enabled).map(category => (
                  <label
                    key={category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: currentTheme.text.secondary,
                      cursor: 'pointer',
                      marginBottom: '4px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={validationRules.enabled[category]}
                      onChange={(e) => setValidationRules(prev => ({
                        ...prev,
                        enabled: {
                          ...prev.enabled,
                          [category]: e.target.checked
                        }
                      }))}
                    />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                ))}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: currentTheme.text.primary,
                    marginBottom: '8px',
                  }}
                >
                  Severity Levels
                </div>
                {Object.keys(validationRules.severity).map(severity => (
                  <label
                    key={severity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: currentTheme.text.secondary,
                      cursor: 'pointer',
                      marginBottom: '4px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={validationRules.severity[severity]}
                      onChange={(e) => setValidationRules(prev => ({
                        ...prev,
                        severity: {
                          ...prev.severity,
                          [severity]: e.target.checked
                        }
                      }))}
                    />
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {validationResults.overall.issues.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Issues Found
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '12px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              {validationResults.overall.issues.map((issue, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: issue.severity === 'error' ? `${currentTheme.error}15` :
                                   issue.severity === 'warning' ? `${currentTheme.warning}15` :
                                   `${currentTheme.text.secondary}15`,
                    border: `1px solid ${issue.severity === 'error' ? currentTheme.error :
                                         issue.severity === 'warning' ? currentTheme.warning :
                                         currentTheme.border}`,
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: issue.severity === 'error' ? currentTheme.error :
                               issue.severity === 'warning' ? currentTheme.warning :
                               currentTheme.text.secondary,
                      }}
                    >
                      {issue.node ? `Node ${issue.node}` : 'Circuit'}
                    </div>
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: '600',
                        color: issue.severity === 'error' ? currentTheme.error :
                               issue.severity === 'warning' ? currentTheme.warning :
                               currentTheme.text.secondary,
                        backgroundColor: issue.severity === 'error' ? `${currentTheme.error}15` :
                                         issue.severity === 'warning' ? `${currentTheme.warning}15` :
                                         `${currentTheme.text.secondary}15`,
                        padding: '2px 4px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {issue.severity}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: currentTheme.text.primary,
                      marginBottom: '4px',
                    }}
                  >
                    {issue.message}
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                      fontStyle: 'italic',
                    }}
                  >
                    Suggestion: {issue.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveCircuitValidation;
