import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const CircuitTestingFramework = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, propagateValues, updateNode } = useCircuitStore();
  
  const [testSuites, setTestSuites] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  // Test suite templates
  const testTemplates = [
    {
      id: 'basic_logic_test',
      name: 'Basic Logic Gates Test',
      description: 'Test all basic logic gates with truth tables',
      tests: [
        {
          name: 'AND Gate Test',
          type: 'gate',
          gateType: 'AND',
          inputs: [
            { A: 0, B: 0, expected: 0 },
            { A: 0, B: 1, expected: 0 },
            { A: 1, B: 0, expected: 0 },
            { A: 1, B: 1, expected: 1 },
          ]
        },
        {
          name: 'OR Gate Test',
          type: 'gate',
          gateType: 'OR',
          inputs: [
            { A: 0, B: 0, expected: 0 },
            { A: 0, B: 1, expected: 1 },
            { A: 1, B: 0, expected: 1 },
            { A: 1, B: 1, expected: 1 },
          ]
        },
        {
          name: 'NOT Gate Test',
          type: 'gate',
          gateType: 'NOT',
          inputs: [
            { A: 0, expected: 1 },
            { A: 1, expected: 0 },
          ]
        },
        {
          name: 'XOR Gate Test',
          type: 'gate',
          gateType: 'XOR',
          inputs: [
            { A: 0, B: 0, expected: 0 },
            { A: 0, B: 1, expected: 1 },
            { A: 1, B: 0, expected: 1 },
            { A: 1, B: 1, expected: 0 },
          ]
        }
      ]
    },
    {
      id: 'adder_test',
      name: 'Adder Circuit Test',
      description: 'Test half and full adder circuits',
      tests: [
        {
          name: 'Half Adder Test',
          type: 'circuit',
          inputs: ['A', 'B'],
          outputs: ['SUM', 'CARRY'],
          testCases: [
            { A: 0, B: 0, expected: { SUM: 0, CARRY: 0 } },
            { A: 0, B: 1, expected: { SUM: 1, CARRY: 0 } },
            { A: 1, B: 0, expected: { SUM: 1, CARRY: 0 } },
            { A: 1, B: 1, expected: { SUM: 0, CARRY: 1 } },
          ]
        },
        {
          name: 'Full Adder Test',
          type: 'circuit',
          inputs: ['A', 'B', 'CIN'],
          outputs: ['SUM', 'COUT'],
          testCases: [
            { A: 0, B: 0, CIN: 0, expected: { SUM: 0, COUT: 0 } },
            { A: 0, B: 0, CIN: 1, expected: { SUM: 1, COUT: 0 } },
            { A: 0, B: 1, CIN: 0, expected: { SUM: 1, COUT: 0 } },
            { A: 0, B: 1, CIN: 1, expected: { SUM: 0, COUT: 1 } },
            { A: 1, B: 0, CIN: 0, expected: { SUM: 1, COUT: 0 } },
            { A: 1, B: 0, CIN: 1, expected: { SUM: 0, COUT: 1 } },
            { A: 1, B: 1, CIN: 0, expected: { SUM: 0, COUT: 1 } },
            { A: 1, B: 1, CIN: 1, expected: { SUM: 1, COUT: 1 } },
          ]
        }
      ]
    },
    {
      id: 'sequential_test',
      name: 'Sequential Circuit Test',
      description: 'Test flip-flops and counters',
      tests: [
        {
          name: 'D Flip-Flop Test',
          type: 'sequential',
          inputs: ['D', 'CLK'],
          outputs: ['Q', 'Q_'],
          testCases: [
            { D: 0, CLK: 'rising', expected: { Q: 0, Q_: 1 } },
            { D: 1, CLK: 'rising', expected: { Q: 1, Q_: 0 } },
            { D: 1, CLK: 'falling', expected: { Q: 1, Q_: 0 } }, // Should not change
            { D: 0, CLK: 'rising', expected: { Q: 0, Q_: 1 } },
          ]
        },
        {
          name: 'Counter Test',
          type: 'sequential',
          inputs: ['CLK', 'RESET'],
          outputs: ['COUNT[3:0]'],
          testCases: [
            { CLK: 'rising', RESET: 0, expected: { COUNT: 1 } },
            { CLK: 'rising', RESET: 0, expected: { COUNT: 2 } },
            { CLK: 'rising', RESET: 0, expected: { COUNT: 3 } },
            { CLK: 'rising', RESET: 1, expected: { COUNT: 0 } }, // Reset
            { CLK: 'rising', RESET: 0, expected: { COUNT: 1 } },
          ]
        }
      ]
    }
  ];

  // Circuit validation rules
  const validationRules = [
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
            severity: 'error'
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
                severity: 'error'
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
            const cycle = path.slice(cycleStart).map(id => {
              const node = nodes.find(n => n.id === id);
              return node ? node.data.label : id;
            });
            
            issues.push({
              node: nodeId,
              message: `Feedback loop detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
              severity: 'warning'
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
      id: 'output_connected',
      name: 'Output Connected',
      description: 'At least one output node should be connected',
      severity: 'info',
      check: () => {
        const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
        const connectedOutputs = outputNodes.filter(node => 
          edges.some(e => e.target === node.id)
        );
        
        return {
          passed: connectedOutputs.length > 0,
          issues: outputNodes.length === 0 ? [{
            node: null,
            message: 'No output nodes found in circuit',
            severity: 'info'
          }] : []
        };
      }
    }
  ];

  // Run validation
  const runValidation = () => {
    const results = validationRules.map(rule => ({
      ...rule.check(),
      rule: rule.name,
      description: rule.description,
      severity: rule.severity
    }));
    
    setTestResults(results);
    return results;
  };

  // Run test suite
  const runTestSuite = async (testSuite) => {
    setIsRunning(true);
    setTestProgress(0);
    const results = [];
    
    for (let i = 0; i < testSuite.tests.length; i++) {
      const test = testSuite.tests[i];
      const testResult = await runSingleTest(test);
      results.push(testResult);
      setTestProgress(((i + 1) / testSuite.tests.length) * 100);
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTestResults(results);
    setIsRunning(false);
    return results;
  };

  // Run single test
  const runSingleTest = async (test) => {
    const startTime = Date.now();
    let passed = 0;
    let failed = 0;
    const issues = [];
    
    for (const testCase of test.inputs || test.testCases) {
      try {
        // Set input values
        Object.keys(testCase).forEach(key => {
          if (key !== 'expected') {
            const inputNode = nodes.find(n => n.data.label === key);
            if (inputNode) {
              updateNode(inputNode.id, { 
                data: { ...inputNode.data, value: testCase[key] }
              });
            }
          }
        });
        
        // Wait for propagation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check outputs
        const expected = testCase.expected;
        let testPassed = true;
        
        for (const [outputName, expectedValue] of Object.entries(expected)) {
          const outputNode = nodes.find(n => n.data.label === outputName);
          if (outputNode) {
            const actualValue = outputNode.data.value;
            if (actualValue !== expectedValue) {
              testPassed = false;
              issues.push({
                testCase,
                output: outputName,
                expected: expectedValue,
                actual: actualValue
              });
            }
          }
        }
        
        if (testPassed) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        issues.push({
          testCase,
          error: error.message
        });
      }
    }
    
    const endTime = Date.now();
    
    return {
      testName: test.name,
      passed,
      failed,
      total: test.inputs?.length || test.testCases?.length,
      duration: endTime - startTime,
      issues,
      status: failed === 0 ? 'passed' : 'failed'
    };
  };

  // Create custom test
  const createCustomTest = (name, description, testCases) => {
    const customTest = {
      id: `custom_${Date.now()}`,
      name,
      description,
      tests: testCases
    };
    
    setTestSuites(prev => [...prev, customTest]);
    return customTest;
  };

  // Generate test report
  const generateTestReport = (results) => {
    const totalTests = results.reduce((sum, r) => sum + (r.total || 0), 0);
    const totalPassed = results.reduce((sum, r) => sum + (r.passed || 0), 0);
    const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
    const passRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
    
    const report = {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString()
      },
      details: results
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return report;
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
          <span style={{ fontSize: '20px' }}>Test</span>
          Circuit Testing Framework
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
            Validate Circuit
          </button>

          <button
            onClick={() => generateTestReport(testResults)}
            disabled={testResults.length === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: testResults.length > 0 ? currentTheme.secondary : currentTheme.text.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: testResults.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Test Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {/* Test Templates */}
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
            Test Templates
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
            }}
          >
            {testTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  backgroundColor: currentTheme.surface,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => runTestSuite(template)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: currentTheme.text.primary,
                        marginBottom: '4px',
                      }}
                    >
                      {template.name}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                        lineHeight: '1.4',
                      }}
                    >
                      {template.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: currentTheme.text.secondary,
                      backgroundColor: `${currentTheme.primary}15`,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {template.tests.length} tests
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '9px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {template.tests.map((test, index) => (
                    <span key={index}>{test.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Progress */}
        {isRunning && (
          <div
            style={{
              backgroundColor: `${currentTheme.background}50`,
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${currentTheme.border}`,
              marginBottom: '20px',
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
              Running Tests...
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: currentTheme.border,
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${testProgress}%`,
                  height: '100%',
                  backgroundColor: currentTheme.primary,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                fontSize: '10px',
                color: currentTheme.text.secondary,
                marginTop: '4px',
              }}
            >
              {testProgress.toFixed(1)}% Complete
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
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
              Test Results
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
              }}
            >
              {testResults.map((result, index) => (
                <div
                  key={index}
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
                      {result.testName || result.rule}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: result.status === 'passed' ? currentTheme.success : 
                               result.status === 'failed' ? currentTheme.error : currentTheme.warning,
                        backgroundColor: result.status === 'passed' ? `${currentTheme.success}15` : 
                                       result.status === 'failed' ? `${currentTheme.error}15` : `${currentTheme.warning}15`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {result.status || (result.passed ? 'PASSED' : 'FAILED')}
                    </div>
                  </div>

                  {result.issues && result.issues.length > 0 && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                        marginBottom: '8px',
                      }}
                    >
                      {result.issues.length} issues found
                    </div>
                  )}

                  {result.description && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: currentTheme.text.secondary,
                        fontStyle: 'italic',
                      }}
                    >
                      {result.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitTestingFramework;
