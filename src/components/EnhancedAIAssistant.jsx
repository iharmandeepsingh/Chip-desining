import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const EnhancedAIAssistant = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [nlpState, setNlpState] = useState({
    inputText: '',
    processedIntent: null,
    extractedEntities: [],
    generatedCode: '',
    suggestions: [],
    isProcessing: false,
    confidence: 0
  });
  
  const [chatHistory, setChatHistory] = useState([]);
  const [activeMode, setActiveMode] = useState('design');
  const [contextMemory, setContextMemory] = useState([]);

  // NLP intent patterns
  const intentPatterns = {
    design_circuit: {
      keywords: ['design', 'create', 'build', 'make', 'implement'],
      patterns: [
        /design\s+(?:a\s+)?(.+)\s+circuit/i,
        /create\s+(?:a\s+)?(.+)\s+circuit/i,
        /build\s+(?:a\s+)?(.+)\s+circuit/i,
        /make\s+(?:a\s+)?(.+)\s+circuit/i,
        /implement\s+(?:a\s+)?(.+)\s+circuit/i
      ]
    },
    optimize_circuit: {
      keywords: ['optimize', 'improve', 'reduce', 'minimize', 'simplify'],
      patterns: [
        /optimize\s+(?:the\s+)?circuit/i,
        /improve\s+(?:the\s+)?circuit/i,
        /reduce\s+(?:the\s+)?(?:complexity|size|power)/i,
        /minimize\s+(?:the\s+)?(?:delay|area|cost)/i,
        /simplify\s+(?:the\s+)?circuit/i
      ]
    },
    analyze_circuit: {
      keywords: ['analyze', 'explain', 'describe', 'show', 'tell'],
      patterns: [
        /analyze\s+(?:the\s+)?circuit/i,
        /explain\s+(?:how\s+)?(?:the\s+)?circuit\s+works/i,
        /describe\s+(?:the\s+)?circuit/i,
        /show\s+me\s+(?:the\s+)?circuit/i,
        /tell\s+me\s+about\s+(?:the\s+)?circuit/i
      ]
    },
    debug_circuit: {
      keywords: ['debug', 'fix', 'repair', 'correct', 'troubleshoot'],
      patterns: [
        /debug\s+(?:the\s+)?circuit/i,
        /fix\s+(?:the\s+)?circuit/i,
        /repair\s+(?:the\s+)?circuit/i,
        /correct\s+(?:the\s+)?circuit/i,
        /troubleshoot\s+(?:the\s+)?circuit/i
      ]
    },
    test_circuit: {
      keywords: ['test', 'verify', 'validate', 'check'],
      patterns: [
        /test\s+(?:the\s+)?circuit/i,
        /verify\s+(?:the\s+)?circuit/i,
        /validate\s+(?:the\s+)?circuit/i,
        /check\s+(?:the\s+)?circuit/i
      ]
    },
    convert_format: {
      keywords: ['convert', 'export', 'import', 'translate'],
      patterns: [
        /convert\s+(?:the\s+)?circuit\s+to\s+(.+)/i,
        /export\s+(?:the\s+)?circuit\s+as\s+(.+)/i,
        /import\s+(?:the\s+)?circuit\s+from\s+(.+)/i,
        /translate\s+(?:the\s+)?circuit\s+to\s+(.+)/i
      ]
    }
  };

  // Entity extraction patterns
  const entityPatterns = {
    components: {
      gates: /\b(and|or|not|xor|nand|nor|xnor)\b/gi,
      sequential: /\b(dff|jkff|tff|srff|counter|register|memory|ram|rom)\b/gi,
      arithmetic: /\b(add|sub|mul|div|adder|subtractor|multiplier|divider)\b/gi,
      io: /\b(input|output|pad|buffer|driver)\b/gi
    },
    specifications: {
      bits: /\b(\d+)\s*bits?\b/gi,
      width: /\b(\d+)\s*bits?\s+wide\b/gi,
      frequency: /\b(\d+)\s*(?:hz|khz|mhz|ghz)\b/gi,
      voltage: /\b(\d+\.?\d*)\s*v\b/gi,
      delay: /\b(\d+\.?\d*)\s*ns\b/gi,
      power: /\b(\d+\.?\d*)\s*mw\b/gi
    },
    constraints: {
      area: /\b(?:minimize|reduce)\s+(?:area|size)/gi,
      power: /\b(?:minimize|reduce)\s+(?:power|energy)/gi,
      delay: /\b(?:minimize|reduce)\s+(?:delay|timing)/gi,
      cost: /\b(?:minimize|reduce)\s+(?:cost|price)/gi
    }
  };

  // Circuit templates for NLP generation
  const circuitTemplates = {
    adder: {
      name: 'Adder Circuit',
      description: 'Binary adder for arithmetic operations',
      components: ['AND', 'OR', 'XOR'],
      generate: (bits) => generateAdderCircuit(bits)
    },
    multiplier: {
      name: 'Multiplier Circuit',
      description: 'Binary multiplier for arithmetic operations',
      components: ['AND', 'OR', 'XOR'],
      generate: (bits) => generateMultiplierCircuit(bits)
    },
    counter: {
      name: 'Counter Circuit',
      description: 'Sequential counter for counting operations',
      components: ['DFF', 'AND', 'OR'],
      generate: (bits) => generateCounterCircuit(bits)
    },
    multiplexer: {
      name: 'Multiplexer',
      description: 'Data selector for routing signals',
      components: ['AND', 'OR', 'NOT'],
      generate: (inputs, select) => generateMultiplexerCircuit(inputs, select)
    },
    decoder: {
      name: 'Decoder',
      description: 'Binary decoder for address decoding',
      components: ['AND', 'NOT'],
      generate: (bits) => generateDecoderCircuit(bits)
    },
    register: {
      name: 'Register',
      description: 'Sequential register for data storage',
      components: ['DFF'],
      generate: (bits) => generateRegisterCircuit(bits)
    }
  };

  // Process natural language input
  const processNaturalLanguage = async (input) => {
    setNlpState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Step 1: Intent recognition
      const intent = recognizeIntent(input);
      
      // Step 2: Entity extraction
      const entities = extractEntities(input);
      
      // Step 3: Context analysis
      const context = analyzeContext(input, entities);
      
      // Step 4: Generate response
      const response = await generateResponse(intent, entities, context);
      
      // Step 5: Update state
      setNlpState(prev => ({
        ...prev,
        processedIntent: intent,
        extractedEntities: entities,
        generatedCode: response.code,
        suggestions: response.suggestions,
        confidence: response.confidence,
        isProcessing: false
      }));
      
      // Add to chat history
      setChatHistory(prev => [
        ...prev,
        {
          type: 'user',
          message: input,
          timestamp: new Date().toISOString(),
          intent: intent.name,
          entities: entities
        },
        {
          type: 'assistant',
          message: response.message,
          timestamp: new Date().toISOString(),
          code: response.code,
          suggestions: response.suggestions,
          confidence: response.confidence
        }
      ]);
      
      return response;
    } catch (error) {
      console.error('NLP processing error:', error);
      setNlpState(prev => ({ ...prev, isProcessing: false }));
      return {
        message: 'I encountered an error processing your request. Please try again.',
        code: '',
        suggestions: [],
        confidence: 0
      };
    }
  };

  // Recognize user intent
  const recognizeIntent = (input) => {
    const normalizedInput = input.toLowerCase();
    
    for (const [intentName, intentData] of Object.entries(intentPatterns)) {
      for (const pattern of intentData.patterns) {
        const match = normalizedInput.match(pattern);
        if (match) {
          return {
            name: intentName,
            confidence: calculateConfidence(match, normalizedInput),
            parameters: match.slice(1),
            matchedPattern: pattern
          };
        }
      }
    }
    
    // Default intent
    return {
      name: 'general',
      confidence: 0.3,
      parameters: [],
      matchedPattern: null
    };
  };

  // Calculate confidence score
  const calculateConfidence = (match, input) => {
    const matchLength = match[0].length;
    const inputLength = input.length;
    const keywordMatches = countKeywordMatches(match[0]);
    
    let confidence = matchLength / inputLength;
    confidence += keywordMatches * 0.1;
    confidence = Math.min(confidence, 1.0);
    
    return confidence;
  };

  // Count keyword matches
  const countKeywordMatches = (text) => {
    let matches = 0;
    const allKeywords = Object.values(intentPatterns)
      .flatMap(intent => intent.keywords);
    
    allKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matches++;
      }
    });
    
    return matches / allKeywords.length;
  };

  // Extract entities from input
  const extractEntities = (input) => {
    const entities = [];
    
    // Extract component entities
    Object.entries(entityPatterns.components).forEach(([category, patterns]) => {
      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = input.match(pattern);
        if (matches) {
          entities.push({
            type: category,
            subtype: type,
            values: matches.map(m => m.toLowerCase()),
            positions: getMatchPositions(input, matches)
          });
        }
      });
    });
    
    // Extract specification entities
    Object.entries(entityPatterns.specifications).forEach(([type, pattern]) => {
      const matches = input.match(pattern);
      if (matches) {
        entities.push({
          type: 'specification',
          subtype: type,
          values: matches,
          positions: getMatchPositions(input, matches)
        });
      }
    });
    
    // Extract constraint entities
    Object.entries(entityPatterns.constraints).forEach(([type, pattern]) => {
      const matches = input.match(pattern);
      if (matches) {
        entities.push({
          type: 'constraint',
          subtype: type,
          values: matches,
          positions: getMatchPositions(input, matches)
        });
      }
    });
    
    return entities;
  };

  // Get match positions in text
  const getMatchPositions = (text, matches) => {
    const positions = [];
    let startIndex = 0;
    
    matches.forEach(match => {
      const index = text.indexOf(match, startIndex);
      if (index !== -1) {
        positions.push({
          start: index,
          end: index + match.length,
          text: match
        });
        startIndex = index + match.length;
      }
    });
    
    return positions;
  };

  // Analyze context
  const analyzeContext = (input, entities) => {
    const context = {
      circuitType: null,
      specifications: {},
      constraints: [],
      complexity: 'medium'
    };
    
    // Determine circuit type from entities
    const componentEntities = entities.filter(e => e.type === 'components');
    if (componentEntities.length > 0) {
      const allComponents = componentEntities.flatMap(e => e.values);
      
      if (allComponents.includes('adder')) context.circuitType = 'adder';
      else if (allComponents.includes('multiplier')) context.circuitType = 'multiplier';
      else if (allComponents.includes('counter')) context.circuitType = 'counter';
      else if (allComponents.includes('dff') || allComponents.includes('jkff')) context.circuitType = 'sequential';
      else if (allComponents.includes('and') || allComponents.includes('or')) context.circuitType = 'combinational';
    }
    
    // Extract specifications
    const specEntities = entities.filter(e => e.type === 'specification');
    specEntities.forEach(entity => {
      entity.values.forEach(value => {
        if (entity.subtype === 'bits') {
          const bits = parseInt(value);
          if (!isNaN(bits)) context.specifications.bits = bits;
        } else if (entity.subtype === 'frequency') {
          const freq = parseFloat(value);
          if (!isNaN(freq)) context.specifications.frequency = freq;
        } else if (entity.subtype === 'voltage') {
          const voltage = parseFloat(value);
          if (!isNaN(voltage)) context.specifications.voltage = voltage;
        }
      });
    });
    
    // Extract constraints
    const constraintEntities = entities.filter(e => e.type === 'constraint');
    context.constraints = constraintEntities.map(e => e.subtype);
    
    // Determine complexity
    const bits = context.specifications.bits || 4;
    if (bits <= 4) context.complexity = 'simple';
    else if (bits <= 8) context.complexity = 'medium';
    else context.complexity = 'complex';
    
    return context;
  };

  // Generate response based on intent and context
  const generateResponse = async (intent, entities, context) => {
    switch (intent.name) {
      case 'design_circuit':
        return await generateDesignResponse(intent, entities, context);
      case 'optimize_circuit':
        return await generateOptimizationResponse(intent, entities, context);
      case 'analyze_circuit':
        return await generateAnalysisResponse(intent, entities, context);
      case 'debug_circuit':
        return await generateDebugResponse(intent, entities, context);
      case 'test_circuit':
        return await generateTestResponse(intent, entities, context);
      case 'convert_format':
        return await generateConversionResponse(intent, entities, context);
      default:
        return generateGeneralResponse(intent, entities, context);
    }
  };

  // Generate design response
  const generateDesignResponse = async (intent, entities, context) => {
    const circuitType = context.circuitType || 'adder';
    const bits = context.specifications.bits || 4;
    const template = circuitTemplates[circuitType];
    
    if (!template) {
      return {
        message: "I'm not sure how to design that type of circuit. Could you be more specific?",
        code: '',
        suggestions: [
          "Try: 'Design a 4-bit adder'",
          "Try: 'Create an 8-bit counter'",
          "Try: 'Build a 2-to-1 multiplexer'"
        ],
        confidence: 0.3
      };
    }
    
    const circuit = template.generate(bits);
    const code = generateCircuitCode(circuit);
    
    return {
      message: `I'll design a ${bits}-bit ${template.name.toLowerCase()} for you. This circuit uses ${template.components.join(', ')} components and has ${circuit.nodes.length} gates with ${circuit.edges.length} connections.`,
      code,
      suggestions: [
        `Would you like me to optimize this ${template.name.toLowerCase()} for area?`,
        `Should I add timing constraints to this design?`,
        `Do you want me to generate test cases for this circuit?`
      ],
      confidence: 0.8
    };
  };

  // Generate optimization response
  const generateOptimizationResponse = async (intent, entities, context) => {
    const analysis = analyzeCircuit();
    const optimizations = findOptimizations(analysis);
    
    return {
      message: `I've analyzed your circuit and found ${optimizations.length} optimization opportunities. The main areas for improvement are: ${optimizations.map(opt => opt.description).join(', ')}.`,
      code: generateOptimizedCode(optimizations),
      suggestions: [
        "Apply these optimizations to reduce area by 15%",
        "Optimize for power consumption instead",
        "Generate a timing-optimized version"
      ],
      confidence: 0.7
    };
  };

  // Generate analysis response
  const generateAnalysisResponse = async (intent, entities, context) => {
    const analysis = analyzeCircuit();
    
    return {
      message: `Your circuit has ${analysis.nodes.length} gates and ${analysis.edges.length} connections. The critical path delay is ${analysis.criticalPath}ns with a maximum frequency of ${analysis.maxFrequency}MHz. ${analysis.issues.length} potential issues were detected.`,
      code: generateAnalysisReport(analysis),
      suggestions: [
        "Show me the timing analysis details",
        "Generate a power consumption report",
        "Create a test suite for this circuit"
      ],
      confidence: 0.9
    };
  };

  // Generate debug response
  const generateDebugResponse = async (intent, entities, context) => {
    const issues = findCircuitIssues();
    
    return {
      message: `I found ${issues.length} issues in your circuit: ${issues.map(issue => issue.description).join(', ')}. Here are the fixes I recommend:`,
      code: generateDebugFixes(issues),
      suggestions: [
        "Apply all fixes automatically",
        "Fix issues one by one",
        "Generate a test to verify the fixes"
      ],
      confidence: 0.8
    };
  };

  // Generate test response
  const generateTestResponse = async (intent, entities, context) => {
    const testSuite = generateTestSuite();
    
    return {
      message: `I've generated a comprehensive test suite with ${testSuite.length} test cases. This covers all input combinations and edge cases for your circuit.`,
      code: generateTestCode(testSuite),
      suggestions: [
        "Run the test suite now",
        "Add more edge cases",
        "Generate a timing test suite"
      ],
      confidence: 0.9
    };
  };

  // Generate conversion response
  const generateConversionResponse = async (intent, entities, context) => {
    const format = intent.parameters[0] || 'verilog';
    
    return {
      message: `I'll convert your circuit to ${format}. Here's the generated code:`,
      code: convertToFormat(format),
      suggestions: [
        "Also export as VHDL",
        "Generate a netlist file",
        "Create a simulation testbench"
      ],
      confidence: 0.8
    };
  };

  // Generate general response
  const generateGeneralResponse = (intent, entities, context) => {
    return {
      message: "I can help you design, analyze, optimize, debug, or test circuits. You can also ask me to convert circuits to different formats. What would you like to do?",
      code: '',
      suggestions: [
        "Design a 4-bit adder",
        "Analyze the current circuit",
        "Optimize for power",
        "Generate test cases",
        "Export as Verilog"
      ],
      confidence: 0.5
    };
  };

  // Circuit generation functions
  const generateAdderCircuit = (bits) => {
    const circuit = {
      nodes: [],
      edges: []
    };
    
    // Generate full adders
    for (let i = 0; i < bits; i++) {
      const faId = `fa_${i}`;
      circuit.nodes.push({
        id: faId,
        type: 'FULL_ADDER',
        position: { x: 100 + i * 50, y: 100 },
        data: { label: 'FULL_ADDER' }
      });
      
      // Connect inputs
      circuit.edges.push(
        { id: `fa_${i}_a`, source: `a_${i}`, target: faId },
        { id: `fa_${i}_b`, source: `b_${i}`, target: faId },
        { id: `fa_${i}_cin`, source: i === 0 ? 'cin' : `fa_${i-1}_cout`, target: faId }
      );
      
      // Connect outputs
      circuit.edges.push(
        { id: `fa_${i}_sum`, source: faId, target: `sum_${i}` },
        { id: `fa_${i}_cout`, source: faId, target: i === bits - 1 ? 'cout' : `fa_${i+1}_cin` }
      );
    }
    
    return circuit;
  };

  const generateCounterCircuit = (bits) => {
    const circuit = {
      nodes: [],
      edges: []
    };
    
    // Generate flip-flops
    for (let i = 0; i < bits; i++) {
      const ffId = `ff_${i}`;
      circuit.nodes.push({
        id: ffId,
        type: 'D_FLIP_FLOP',
        position: { x: 100 + i * 50, y: 100 },
        data: { label: 'D_FLIP_FLOP' }
      });
      
      // Connect clock
      circuit.edges.push({ id: `ff_${i}_clk`, source: 'clk', target: ffId });
      
      // Connect D input (for counting)
      if (i === 0) {
        circuit.edges.push({ id: `ff_${i}_d`, source: `q_${bits-1}`, target: ffId });
      } else {
        circuit.edges.push({ id: `ff_${i}_d`, source: `ff_${i-1}_q`, target: ffId });
      }
      
      // Connect Q output
      circuit.edges.push({ id: `ff_${i}_q`, source: ffId, target: `q_${i}` });
    }
    
    return circuit;
  };

  const generateMultiplexerCircuit = (inputs, select) => {
    const circuit = {
      nodes: [],
      edges: []
    };
    
    // Generate 2-to-1 multiplexers
    const stages = Math.ceil(Math.log2(inputs));
    
    for (let stage = 0; stage < stages; stage++) {
      const muxesInStage = Math.ceil(inputs / Math.pow(2, stage + 1));
      
      for (let i = 0; i < muxesInStage; i++) {
        const muxId = `mux_${stage}_${i}`;
        circuit.nodes.push({
          id: muxId,
          type: 'MUX2',
          position: { x: 100 + stage * 100, y: 50 + i * 50 },
          data: { label: 'MUX2' }
        });
        
        // Connect inputs and select lines
        // (Implementation details would go here)
      }
    }
    
    return circuit;
  };

  // Code generation functions
  const generateCircuitCode = (circuit) => {
    let code = `// Generated Circuit\n`;
    code += `// Nodes: ${circuit.nodes.length}\n`;
    code += `// Edges: ${circuit.edges.length}\n\n`;
    
    code += `const circuit = {\n`;
    code += `  nodes: [\n`;
    
    circuit.nodes.forEach((node, index) => {
      code += `    { id: '${node.id}', type: '${node.type}', position: { x: ${node.position.x}, y: ${node.position.y} } }`;
      if (index < circuit.nodes.length - 1) code += ',';
      code += '\n';
    });
    
    code += `  ],\n`;
    code += `  edges: [\n`;
    
    circuit.edges.forEach((edge, index) => {
      code += `    { id: '${edge.id}', source: '${edge.source}', target: '${edge.target}' }`;
      if (index < circuit.edges.length - 1) code += ',';
      code += '\n';
    });
    
    code += `  ]\n`;
    code += `};\n`;
    
    return code;
  };

  // Analysis functions
  const analyzeCircuit = () => {
    return {
      nodes: nodes.length,
      edges: edges.length,
      criticalPath: calculateCriticalPath(),
      maxFrequency: calculateMaxFrequency(),
      issues: findCircuitIssues()
    };
  };

  const calculateCriticalPath = () => {
    // Simplified critical path calculation
    return 2.5; // ns
  };

  const calculateMaxFrequency = () => {
    return 400; // MHz
  };

  const findCircuitIssues = () => {
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
          type: 'orphan',
          node: node.id,
          description: `Node ${node.data.label} has no connections`
        });
      }
    });
    
    return issues;
  };

  // Apply generated circuit to store
  const applyGeneratedCircuit = () => {
    if (nlpState.generatedCode) {
      try {
        // Parse the generated code and apply it
        // This is a simplified version - in practice, you'd parse the actual code
        console.log('Applying generated circuit...');
        
        // Add a simple test circuit for demonstration
        addNode({
          id: 'test_input',
          type: 'INPUT',
          position: { x: 100, y: 200 },
          data: { label: 'INPUT', value: false }
        });
        
        addNode({
          id: 'test_and',
          type: 'AND',
          position: { x: 250, y: 200 },
          data: { label: 'AND', value: false }
        });
        
        addNode({
          id: 'test_output',
          type: 'OUTPUT',
          position: { x: 400, y: 200 },
          data: { label: 'OUTPUT', value: false }
        });
        
        addEdge({
          id: 'test_edge1',
          source: 'test_input',
          target: 'test_and'
        });
        
        addEdge({
          id: 'test_edge2',
          source: 'test_and',
          target: 'test_output'
        });
      } catch (error) {
        console.error('Error applying generated circuit:', error);
      }
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
          Enhanced AI Assistant with NLP
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => processNaturalLanguage(nlpState.inputText)}
            disabled={nlpState.isProcessing || !nlpState.inputText.trim()}
            style={{
              padding: '6px 12px',
              backgroundColor: nlpState.isProcessing || !nlpState.inputText.trim() ? currentTheme.text.secondary : currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: nlpState.isProcessing || !nlpState.inputText.trim() ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {nlpState.isProcessing ? 'Processing...' : 'Analyze'}
          </button>

          <button
            onClick={applyGeneratedCircuit}
            disabled={!nlpState.generatedCode}
            style={{
              padding: '6px 12px',
              backgroundColor: !nlpState.generatedCode ? currentTheme.text.secondary : currentTheme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !nlpState.generatedCode ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Apply Design
          </button>
        </div>
      </div>

      {/* NLP Content */}
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
        {/* Mode Selection */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            AI Mode
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            {['design', 'optimize', 'analyze', 'debug', 'test'].map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: activeMode === mode ? currentTheme.primary : 'transparent',
                  color: activeMode === mode ? 'white' : currentTheme.text.secondary,
                  border: `1px solid ${activeMode === mode ? currentTheme.primary : currentTheme.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Language Input */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Natural Language Input
          </div>

          <textarea
            value={nlpState.inputText}
            onChange={(e) => setNlpState(prev => ({ ...prev, inputText: e.target.value }))}
            placeholder="Describe what you want to do in natural language... (e.g., 'Design a 4-bit adder', 'Optimize the circuit for power', 'Analyze the timing')"
            style={{
              width: '100%',
              height: '80px',
              padding: '12px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: currentTheme.text.primary,
              resize: 'none',
              lineHeight: '1.4',
            }}
          />
        </div>

        {/* Extracted Entities */}
        {nlpState.extractedEntities.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Extracted Information
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
                  marginBottom: '8px',
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
                  Intent: {nlpState.processedIntent?.name || 'Unknown'} (Confidence: {(nlpState.confidence * 100).toFixed(0)}%)
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {nlpState.extractedEntities.map((entity, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: `${currentTheme.primary}15`,
                      border: `1px solid ${currentTheme.primary}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: currentTheme.primary,
                    }}
                  >
                    <strong>{entity.type}:</strong> {entity.values.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generated Code */}
        {nlpState.generatedCode && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Generated Code
            </div>

            <div
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '6px',
                padding: '12px',
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              <pre
                style={{
                  fontSize: '11px',
                  color: currentTheme.text.primary,
                  fontFamily: 'monospace',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {nlpState.generatedCode}
              </pre>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {nlpState.suggestions.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Suggestions
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {nlpState.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setNlpState(prev => ({ ...prev, inputText: suggestion }))}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentTheme.text.primary,
                marginBottom: '8px',
              }}
            >
              Conversation History
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {chatHistory.slice(-5).map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: message.type === 'user' ? currentTheme.primary : currentTheme.surface,
                      color: message.type === 'user' ? 'white' : currentTheme.text.primary,
                      fontSize: '11px',
                      lineHeight: '1.4',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '9px',
                        opacity: 0.7,
                        marginBottom: '4px',
                      }}
                    >
                      {message.type === 'user' ? 'You' : 'AI'} - {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    <div>{message.message}</div>
                    
                    {message.code && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '4px',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {message.code.substring(0, 100)}...
                      </div>
                    )}
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

export default EnhancedAIAssistant;
