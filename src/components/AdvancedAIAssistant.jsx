import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const AdvancedAIAssistant = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // AI suggestion templates
  const suggestionTemplates = [
    {
      id: 'optimize_circuit',
      name: 'Optimize Circuit',
      description: 'Analyze and optimize current circuit',
      prompt: 'Analyze this circuit and suggest optimizations to reduce gate count and improve performance.',
      icon: 'OPT'
    },
    {
      id: 'complete_circuit',
      name: 'Complete Circuit',
      description: 'Complete partially designed circuit',
      prompt: 'Complete this circuit by adding missing connections and components.',
      icon: 'COMP'
    },
    {
      id: 'debug_circuit',
      name: 'Debug Circuit',
      description: 'Find and fix issues in the circuit',
      prompt: 'Debug this circuit and identify any logic errors or connection issues.',
      icon: 'DEBUG'
    },
    {
      id: 'improve_design',
      name: 'Improve Design',
      description: 'Suggest design improvements',
      prompt: 'Analyze this circuit design and suggest improvements for better performance and reliability.',
      icon: 'IMP'
    },
    {
      id: 'generate_test',
      name: 'Generate Tests',
      description: 'Create test cases for the circuit',
      prompt: 'Generate comprehensive test cases for this circuit to verify its functionality.',
      icon: 'TEST'
    },
    {
      id: 'explain_circuit',
      name: 'Explain Circuit',
      description: 'Explain how the circuit works',
      prompt: 'Explain how this circuit works, including its functionality and key components.',
      icon: 'EXP'
    }
  ];

  // Circuit analysis functions
  const analyzeCircuit = () => {
    const analysis = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes: {},
      complexity: calculateComplexity(),
      issues: detectIssues(),
      optimizations: findOptimizations(),
      suggestions: generateSuggestions()
    };

    // Count node types
    nodes.forEach(node => {
      analysis.nodeTypes[node.data.label] = (analysis.nodeTypes[node.data.label] || 0) + 1;
    });

    return analysis;
  };

  const calculateComplexity = () => {
    let complexity = 0;
    
    // Base complexity
    complexity += nodes.length * 1;
    complexity += edges.length * 0.5;
    
    // Sequential components add complexity
    const sequentialNodes = nodes.filter(n => 
      ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER', 'REGISTER'].includes(n.data.label)
    );
    complexity += sequentialNodes.length * 2;
    
    // Feedback loops
    const feedbackLoops = detectFeedbackLoops();
    complexity += feedbackLoops.length * 5;
    
    return complexity;
  };

  const detectIssues = () => {
    const issues = [];
    
    // Check for orphan nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && node.data.label !== 'INPUT') {
        issues.push({
          type: 'orphan_node',
          node: node.id,
          message: `Node ${node.data.label} has no connections`,
          severity: 'warning'
        });
      }
    });
    
    // Check for floating inputs
    nodes.forEach(node => {
      if (['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(node.data.label)) {
        const inputEdges = edges.filter(e => e.target === node.id);
        const requiredInputs = node.data.label === 'NOT' ? 1 : 2;
        
        if (inputEdges.length < requiredInputs) {
          issues.push({
            type: 'floating_input',
            node: node.id,
            message: `${node.data.label} gate has ${inputEdges.length}/${requiredInputs} inputs connected`,
            severity: 'error'
          });
        }
      }
    });
    
    // Check for feedback loops
    const feedbackLoops = detectFeedbackLoops();
    feedbackLoops.forEach(loop => {
      issues.push({
        type: 'feedback_loop',
        nodes: loop,
        message: `Feedback loop detected: ${loop.map(id => {
          const node = nodes.find(n => n.id === id);
          return node ? node.data.label : id;
        }).join(' -> ')}`,
        severity: 'warning'
      });
    });
    
    return issues;
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

  const findOptimizations = () => {
    const optimizations = [];
    
    // Find redundant gates
    optimizations.push(...findRedundantGates());
    
    // Find opportunities for gate reduction
    optimizations.push(...findGateReductions());
    
    // Find connection optimizations
    optimizations.push(...findConnectionOptimizations());
    
    return optimizations;
  };

  const findRedundantGates = () => {
    const optimizations = [];
    
    // Find double NOT gates
    nodes.forEach(node => {
      if (node.data.label === 'NOT') {
        const inputEdge = edges.find(e => e.target === node.id);
        if (inputEdge) {
          const inputNode = nodes.find(n => n.id === inputEdge.source);
          if (inputNode && inputNode.data.label === 'NOT') {
            optimizations.push({
              type: 'redundant_not',
              nodes: [inputNode.id, node.id],
              message: 'Double NOT gates can be removed',
              impact: 'Remove 2 NOT gates'
            });
          }
        }
      }
    });
    
    return optimizations;
  };

  const findGateReductions = () => {
    const optimizations = [];
    
    // Find AND gates with identical inputs
    nodes.forEach(node => {
      if (node.data.label === 'AND') {
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputNodes = inputEdges.map(e => nodes.find(n => n.id === e.source));
        
        if (inputNodes.length === 2 && inputNodes[0] && inputNodes[1]) {
          if (inputNodes[0].id === inputNodes[1].id) {
            optimizations.push({
              type: 'identical_inputs',
              nodes: [node.id],
              message: 'AND gate with identical inputs can be replaced with direct connection',
              impact: 'Replace AND gate with wire'
            });
          }
        }
      }
    });
    
    return optimizations;
  };

  const findConnectionOptimizations = () => {
    const optimizations = [];
    
    // Find long wires that could be shortened
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const distance = Math.sqrt(
          Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
          Math.pow(targetNode.position.y - sourceNode.position.y, 2)
        );
        
        if (distance > 200) {
          optimizations.push({
            type: 'long_wire',
            edge: edge.id,
            message: 'Long wire could be shortened by repositioning components',
            impact: 'Reduce wire length and improve performance'
          });
        }
      }
    });
    
    return optimizations;
  };

  const generateSuggestions = () => {
    const suggestions = [];
    const analysis = analyzeCircuit();
    
    // Suggest based on complexity
    if (analysis.complexity > 100) {
      suggestions.push({
        type: 'complexity',
        message: 'Circuit complexity is high. Consider breaking into smaller modules.',
        priority: 'high'
      });
    }
    
    // Suggest based on node types
    if (analysis.nodeTypes['AND'] > 5) {
      suggestions.push({
        type: 'gate_usage',
        message: 'Many AND gates detected. Consider using NAND gates for better optimization.',
        priority: 'medium'
      });
    }
    
    // Suggest based on issues
    if (analysis.issues.some(issue => issue.severity === 'error')) {
      suggestions.push({
        type: 'issues',
        message: 'Critical issues found. Fix errors before proceeding.',
        priority: 'critical'
      });
    }
    
    return suggestions;
  };

  // Process AI request
  const processAIRequest = async (request) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = analyzeCircuit();
      let response = '';
      
      // Generate response based on request type
      if (request.toLowerCase().includes('optimize')) {
        response = generateOptimizationResponse(analysis);
      } else if (request.toLowerCase().includes('complete')) {
        response = generateCompletionResponse(analysis);
      } else if (request.toLowerCase().includes('debug')) {
        response = generateDebugResponse(analysis);
      } else if (request.toLowerCase().includes('explain')) {
        response = generateExplanationResponse(analysis);
      } else if (request.toLowerCase().includes('test')) {
        response = generateTestResponse(analysis);
      } else {
        response = generateGeneralResponse(analysis, request);
      }
      
      // Add to chat history
      setChatHistory(prev => [...prev, {
        type: 'user',
        message: request,
        timestamp: new Date().toISOString()
      }, {
        type: 'ai',
        message: response,
        timestamp: new Date().toISOString()
      }]);
      
      return response;
    } catch (error) {
      console.error('AI processing error:', error);
      return 'Sorry, I encountered an error processing your request.';
    } finally {
      setIsProcessing(false);
    }
  };

  const generateOptimizationResponse = (analysis) => {
    let response = `I've analyzed your circuit and found several optimization opportunities:\n\n`;
    
    if (analysis.optimizations.length > 0) {
      response += `**Optimizations Found:**\n`;
      analysis.optimizations.forEach((opt, index) => {
        response += `${index + 1}. ${opt.message}\n`;
        response += `   Impact: ${opt.impact}\n\n`;
      });
    } else {
      response += `No immediate optimizations found. Your circuit appears to be well-optimized.\n\n`;
    }
    
    response += `**Circuit Statistics:**\n`;
    response += `- Total nodes: ${analysis.nodeCount}\n`;
    response += `- Total connections: ${analysis.edgeCount}\n`;
    response += `- Complexity score: ${analysis.complexity}\n`;
    response += `- Issues found: ${analysis.issues.length}\n\n`;
    
    if (analysis.suggestions.length > 0) {
      response += `**Additional Suggestions:**\n`;
      analysis.suggestions.forEach((suggestion, index) => {
        response += `${index + 1}. ${suggestion.message}\n`;
      });
    }
    
    return response;
  };

  const generateCompletionResponse = (analysis) => {
    let response = `I'll help complete your circuit. Here's what I found:\n\n`;
    
    response += `**Current State:**\n`;
    response += `- Nodes: ${analysis.nodeCount}\n`;
    response += `- Connections: ${analysis.edgeCount}\n`;
    response += `- Issues: ${analysis.issues.length}\n\n`;
    
    if (analysis.issues.length > 0) {
      response += `**Issues to Fix:**\n`;
      analysis.issues.forEach((issue, index) => {
        response += `${index + 1}. ${issue.message}\n`;
      });
      response += `\n`;
    }
    
    response += `**Completion Suggestions:**\n`;
    
    // Find missing connections
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    if (inputNodes.length > 0 && outputNodes.length === 0) {
      response += `- Add OUTPUT nodes to capture circuit results\n`;
    }
    
    if (outputNodes.length > 0 && inputNodes.length === 0) {
      response += `- Add INPUT nodes to drive the circuit\n`;
    }
    
    // Find gates with missing connections
    const incompleteGates = analysis.issues.filter(issue => issue.type === 'floating_input');
    if (incompleteGates.length > 0) {
      response += `- Complete connections for ${incompleteGates.length} gates\n`;
    }
    
    return response;
  };

  const generateDebugResponse = (analysis) => {
    let response = `I've debugged your circuit and found the following:\n\n`;
    
    if (analysis.issues.length === 0) {
      response += `**Great news!** No issues found in your circuit. Everything appears to be working correctly.\n\n`;
    } else {
      response += `**Issues Found:**\n`;
      analysis.issues.forEach((issue, index) => {
        const severity = issue.severity === 'error' ? 'ERROR' : 
                       issue.severity === 'warning' ? 'WARNING' : 'INFO';
        response += `${index + 1}. [${severity}] ${issue.message}\n`;
      });
      response += `\n`;
    }
    
    response += `**Debug Recommendations:**\n`;
    
    if (analysis.issues.some(issue => issue.type === 'floating_input')) {
      response += `- Connect all gate inputs properly\n`;
    }
    
    if (analysis.issues.some(issue => issue.type === 'orphan_node')) {
      response += `- Remove or connect orphan nodes\n`;
    }
    
    if (analysis.issues.some(issue => issue.type === 'feedback_loop')) {
      response += `- Review feedback loops for intentional design\n`;
    }
    
    return response;
  };

  const generateExplanationResponse = (analysis) => {
    let response = `Here's an explanation of your circuit:\n\n`;
    
    response += `**Circuit Overview:**\n`;
    response += `This circuit contains ${analysis.nodeCount} components connected by ${analysis.edgeCount} wires.\n\n`;
    
    response += `**Component Breakdown:**\n`;
    Object.entries(analysis.nodeTypes).forEach(([type, count]) => {
      response += `- ${count} × ${type}\n`;
    });
    response += `\n`;
    
    response += `**Functionality:**\n`;
    
    // Analyze circuit function based on components
    const hasSequential = Object.keys(analysis.nodeTypes).some(type => 
      ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER', 'REGISTER'].includes(type)
    );
    
    const hasMemory = Object.keys(analysis.nodeTypes).some(type => 
      ['RAM', 'ROM', 'MEMORY'].includes(type)
    );
    
    if (hasSequential) {
      response += `This is a sequential circuit with memory elements. The circuit likely stores and processes data over multiple clock cycles.\n`;
    } else if (hasMemory) {
      response += `This circuit includes memory components for data storage and retrieval.\n`;
    } else {
      response += `This is a combinational circuit that processes inputs immediately without memory.\n`;
    }
    
    response += `\n**Key Features:**\n`;
    response += `- Complexity score: ${analysis.complexity}\n`;
    response += `- Performance level: ${analysis.complexity < 50 ? 'Good' : analysis.complexity < 100 ? 'Moderate' : 'High'}\n`;
    
    return response;
  };

  const generateTestResponse = (analysis) => {
    let response = `I'll generate comprehensive test cases for your circuit:\n\n`;
    
    response += `**Test Strategy:**\n`;
    response += `Based on your circuit analysis, I'll create tests for:\n`;
    response += `- Functional verification\n`;
    response += `- Edge cases\n`;
    response += `- Performance validation\n\n`;
    
    response += `**Test Cases:**\n`;
    
    // Generate test cases based on circuit type
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    
    if (inputNodes.length > 0 && outputNodes.length > 0) {
      response += `1. **Truth Table Test**: Test all ${Math.pow(2, inputNodes.length)} input combinations\n`;
      response += `2. **Timing Test**: Verify signal propagation timing\n`;
      response += `3. **Load Test**: Test circuit under maximum load\n`;
      response += `4. **Edge Case Test**: Test boundary conditions\n`;
    } else {
      response += `1. **Connectivity Test**: Verify all connections are valid\n`;
      response += `2. **Component Test**: Test individual component functionality\n`;
    }
    
    response += `\n**Expected Results:**\n`;
    response += `- All tests should pass for a correctly designed circuit\n`;
    response += `- Any failing tests indicate design issues\n`;
    response += `- Performance should meet timing requirements\n`;
    
    return response;
  };

  const generateGeneralResponse = (analysis, request) => {
    return `I understand you want to: "${request}". Based on your circuit analysis:\n\n` +
           `Your circuit has ${analysis.nodeCount} nodes and ${analysis.edgeCount} connections with a complexity score of ${analysis.complexity}.\n\n` +
           `I can help you with circuit optimization, debugging, completion, testing, or explanation. Please let me know which specific aspect you'd like to focus on.`;
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion) => {
    switch (suggestion.type) {
      case 'optimize_circuit':
        return processAIRequest('Optimize this circuit for better performance');
      case 'complete_circuit':
        return processAIRequest('Complete this circuit design');
      case 'debug_circuit':
        return processAIRequest('Debug this circuit and find issues');
      case 'improve_design':
        return processAIRequest('Suggest improvements for this circuit design');
      case 'generate_test':
        return processAIRequest('Generate test cases for this circuit');
      case 'explain_circuit':
        return processAIRequest('Explain how this circuit works');
      default:
        return processAIRequest(suggestion.prompt);
    }
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
          <span style={{ fontSize: '20px' }}>AI</span>
          Advanced AI Assistant
        </div>

        <div
          style={{
            fontSize: '12px',
            color: currentTheme.text.secondary,
            marginBottom: '8px',
          }}
        >
          Ask me to optimize, debug, complete, or explain your circuit
        </div>
      </div>

      {/* AI Assistant Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Quick Suggestions */}
        <div
          style={{
            marginBottom: '16px',
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
            Quick Actions
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px',
            }}
          >
            {suggestionTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => applySuggestion(template)}
                disabled={isProcessing}
                style={{
                  padding: '8px',
                  backgroundColor: currentTheme.surface,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: currentTheme.text.primary,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
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
                  {template.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: currentTheme.text.primary,
                    }}
                  >
                    {template.name}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: currentTheme.text.secondary,
                      textAlign: 'center',
                    }}
                  >
                    {template.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Chat History */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}
          >
            {chatHistory.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: currentTheme.text.secondary,
                  fontSize: '12px',
                  marginTop: '20px',
                }}
              >
                Start a conversation with the AI assistant
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: message.type === 'user' ? currentTheme.primary : `${currentTheme.background}50`,
                      color: message.type === 'user' ? 'white' : currentTheme.text.primary,
                      fontSize: '11px',
                      lineHeight: '1.4',
                    }}
                  >
                    {message.message}
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: currentTheme.text.secondary,
                    fontSize: '11px',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentTheme.primary',
                      borderRadius: '50%',
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Processing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '12px',
              borderTop: `1px solid ${currentTheme.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputText.trim()) {
                    processAIRequest(inputText);
                    setInputText('');
                  }
                }}
                placeholder="Ask me about your circuit..."
                disabled={isProcessing}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: currentTheme.background,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: currentTheme.text.primary,
                }}
              />
              
              <button
                onClick={() => {
                  if (inputText.trim()) {
                    processAIRequest(inputText);
                    setInputText('');
                  }
                }}
                disabled={isProcessing || !inputText.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isProcessing || !inputText.trim() ? currentTheme.text.secondary : currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isProcessing || !inputText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAIAssistant;
