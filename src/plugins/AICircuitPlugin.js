const AICircuitPlugin = {
  name: 'AI Circuit Generator',
  version: '1.0.0',
  type: '综合',
  description: 'AI-powered circuit generation from natural language descriptions',

  // AI circuit generation engine
  simulationEngine: {
    name: 'ai-generator',
    description: 'Natural language to circuit converter',
    
    // Required simulate function for plugin compatibility
    simulate: (circuit, deltaTime = 0) => {
      // AI plugin doesn't need simulation, but function is required
      return {
        nodes: circuit.nodes,
        edges: circuit.edges,
        timing: {
          totalDelay: 0,
          criticalPathDelay: 0,
          averageDelay: 0
        }
      };
    },
    
    // Parse natural language circuit description
    parseDescription: (description) => {
      const lowerDesc = description.toLowerCase();
      
      // Common circuit patterns and their implementations
      const patterns = [
        {
          keywords: ['half adder', 'sum', 'add two bits'],
          generate: () => ({
            type: 'combinational',
            name: 'Half Adder',
            description: 'Adds two single bits with sum and carry',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 100, y: 100 } },
              { type: 'INPUT', label: 'B', position: { x: 100, y: 200 } },
              { type: 'XOR', label: 'XOR1', position: { x: 250, y: 100 } },
              { type: 'AND', label: 'AND1', position: { x: 250, y: 200 } },
              { type: 'XOR', label: 'XOR2', position: { x: 350, y: 150 } },
              { type: 'AND', label: 'AND2', position: { x: 350, y: 250 } },
              { type: 'OUTPUT', label: 'Sum', position: { x: 450, y: 150 } },
              { type: 'OUTPUT', label: 'Carry', position: { x: 450, y: 250 } }
            ],
            edges: [
              { source: 'A', target: 'XOR1' },
              { source: 'B', target: 'XOR1' },
              { source: 'A', target: 'AND1' },
              { source: 'B', target: 'AND1' },
              { source: 'XOR1', target: 'XOR2' },
              { source: 'AND1', target: 'AND2' },
              { source: 'XOR2', target: 'AND2' },
              { source: 'AND2', target: 'Sum' },
              { source: 'AND1', target: 'Carry' }
            ]
          })
        },
        {
          keywords: ['full adder', 'add three bits', '3-bit adder'],
          generate: () => ({
            type: 'combinational',
            name: 'Full Adder',
            description: 'Adds three single bits with sum and carry',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'B', position: { x: 50, y: 200 } },
              { type: 'INPUT', label: 'Cin', position: { x: 50, y: 300 } },
              { type: 'HALF_ADDER', label: 'HA1', position: { x: 200, y: 100 } },
              { type: 'HALF_ADDER', label: 'HA2', position: { x: 200, y: 200 } },
              { type: 'OR', label: 'OR1', position: { x: 350, y: 150 } },
              { type: 'OUTPUT', label: 'Sum', position: { x: 450, y: 150 } },
              { type: 'OUTPUT', label: 'Cout', position: { x: 450, y: 250 } }
            ],
            edges: [
              { source: 'A', target: 'HA1' },
              { source: 'B', target: 'HA1' },
              { source: 'HA1', target: 'HA2' },
              { source: 'Cin', target: 'HA2' },
              { source: 'HA2', target: 'OR1' },
              { source: 'HA1', target: 'Sum' },
              { source: 'HA2', target: 'Cout' }
            ]
          })
        },
        {
          keywords: ['multiplexer', 'mux', 'selector', '2 to 1 mux'],
          generate: () => ({
            type: 'combinational',
            name: '2-to-1 Multiplexer',
            description: 'Selects one of two inputs based on selector',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'B', position: { x: 50, y: 200 } },
              { type: 'INPUT', label: 'S', position: { x: 50, y: 300 } },
              { type: 'NOT', label: 'NOT1', position: { x: 200, y: 150 } },
              { type: 'NOT', label: 'NOT2', position: { x: 200, y: 250 } },
              { type: 'AND', label: 'AND1', position: { x: 300, y: 100 } },
              { type: 'AND', label: 'AND2', position: { x: 300, y: 200 } },
              { type: 'OR', label: 'OR', position: { x: 400, y: 150 } },
              { type: 'OUTPUT', label: 'Y', position: { x: 500, y: 150 } }
            ],
            edges: [
              { source: 'S', target: 'NOT1' },
              { source: 'S', target: 'NOT2' },
              { source: 'A', target: 'AND1' },
              { source: 'NOT1', target: 'AND1' },
              { source: 'B', target: 'AND2' },
              { source: 'NOT2', target: 'AND2' },
              { source: 'AND1', target: 'OR' },
              { source: 'AND2', target: 'OR' },
              { source: 'OR', target: 'Y' }
            ]
          })
        },
        {
          keywords: ['decoder', 'binary decoder', '2 to 4 decoder'],
          generate: () => ({
            type: 'combinational',
            name: '2-to-4 Decoder',
            description: 'Decodes 2-bit binary to 4 individual outputs',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 50, y: 150 } },
              { type: 'INPUT', label: 'B', position: { x: 50, y: 250 } },
              { type: 'NOT', label: 'NOT1', position: { x: 200, y: 100 } },
              { type: 'NOT', label: 'NOT2', position: { x: 200, y: 200 } },
              { type: 'AND', label: 'AND1', position: { x: 300, y: 50 } },
              { type: 'AND', label: 'AND2', position: { x: 300, y: 150 } },
              { type: 'AND', label: 'AND3', position: { x: 300, y: 250 } },
              { type: 'AND', label: 'AND4', position: { x: 300, y: 350 } },
              { type: 'OUTPUT', label: 'Y0', position: { x: 450, y: 50 } },
              { type: 'OUTPUT', label: 'Y1', position: { x: 450, y: 150 } },
              { type: 'OUTPUT', label: 'Y2', position: { x: 450, y: 250 } },
              { type: 'OUTPUT', label: 'Y3', position: { x: 450, y: 350 } }
            ],
            edges: [
              { source: 'A', target: 'NOT1' },
              { source: 'B', target: 'NOT2' },
              { source: 'NOT1', target: 'AND1' },
              { source: 'NOT1', target: 'AND2' },
              { source: 'NOT2', target: 'AND3' },
              { source: 'NOT2', target: 'AND4' },
              { source: 'AND1', target: 'Y0' },
              { source: 'AND2', target: 'Y1' },
              { source: 'AND3', target: 'Y2' },
              { source: 'AND4', target: 'Y3' }
            ]
          })
        },
        {
          keywords: ['counter', 'binary counter', 'up counter'],
          generate: () => ({
            type: 'sequential',
            name: '4-bit Binary Counter',
            description: 'Counts up from 0 to 15 with clock input',
            nodes: [
              { type: 'CLOCK', label: 'CLK', position: { x: 50, y: 200 }, frequency: 1 },
              { type: 'COUNTER', label: 'CNT', position: { x: 200, y: 200 }, bits: 4 }
            ],
            edges: [
              { source: 'CLK', target: 'CNT' }
            ]
          })
        }
      ];

      // Find matching pattern
      for (const pattern of patterns) {
        const matchCount = pattern.keywords.filter(keyword => 
          lowerDesc.includes(keyword)
        ).length;
        
        if (matchCount > 0) {
          return pattern.generate();
        }
      }

      // Default to basic AND gate if no pattern matches
      return {
        type: 'combinational',
        name: 'Basic AND Gate',
        description: 'Simple AND gate with two inputs',
        nodes: [
          { type: 'INPUT', label: 'A', position: { x: 100, y: 150 } },
          { type: 'INPUT', label: 'B', position: { x: 100, y: 250 } },
          { type: 'AND', label: 'AND', position: { x: 250, y: 200 } },
          { type: 'OUTPUT', label: 'Y', position: { x: 400, y: 200 } }
        ],
        edges: [
          { source: 'A', target: 'AND' },
          { source: 'B', target: 'AND' },
          { source: 'AND', target: 'Y' }
        ]
      };
    },

    // Generate circuit from parsed description
    generateCircuit: (description) => {
      console.log('AI generating circuit for:', description);
      const parsed = AICircuitPlugin.simulationEngine.parseDescription(description);
      console.log('Parsed circuit:', parsed);
      
      // Create node mapping for proper edge connections
      const nodeMap = {};
      const nodes = parsed.nodes.map((node, index) => {
        const nodeId = `node_${Date.now()}_${index}`;
        nodeMap[node.label] = nodeId;
        return {
          id: nodeId,
          type: 'gate',
          position: node.position,
          data: {
            label: node.type,
            value: node.type === 'INPUT' ? false : false,
            ...node.data
          }
        };
      });

      const edges = parsed.edges.map((edge, index) => ({
        id: `edge_${Date.now()}_${index}`,
        source: nodeMap[edge.source] || edge.source,
        target: nodeMap[edge.target] || edge.target,
        type: 'animated'
      }));
      
      console.log('Generated nodes:', nodes);
      console.log('Generated edges:', edges);

      return {
        name: parsed.name,
        description: parsed.description,
        type: parsed.type,
        nodes,
        edges,
        confidence: AICircuitPlugin.simulationEngine.calculateConfidence(description, parsed),
        suggestions: AICircuitPlugin.simulationEngine.generateSuggestions(description, parsed)
      };
    },

    // Calculate confidence score for AI generation
    calculateConfidence: (description, parsed) => {
      let confidence = 0.5; // Base confidence
      
      // Boost confidence for specific keywords
      const specificKeywords = ['half adder', 'full adder', 'multiplexer', 'decoder', 'counter'];
      const hasSpecificKeyword = specificKeywords.some(keyword => 
        description.toLowerCase().includes(keyword)
      );
      
      if (hasSpecificKeyword) {
        confidence += 0.3;
      }

      // Boost confidence for longer descriptions
      if (description.length > 20) {
        confidence += 0.1;
      }

      // Boost confidence for technical terms
      const technicalTerms = ['gate', 'logic', 'circuit', 'digital', 'binary', 'truth table'];
      const technicalTermCount = technicalTerms.filter(term => 
        description.toLowerCase().includes(term)
      ).length;
      
      confidence += Math.min(technicalTermCount * 0.05, 0.2);

      return Math.min(confidence, 1.0);
    },

    // Generate alternative suggestions
    generateSuggestions: (description, parsed) => {
      const suggestions = [];
      
      // Suggest related circuits
      if (parsed.name.includes('Adder')) {
        suggestions.push('Try "subtractor" for subtraction operations');
        suggestions.push('Consider "ripple carry adder" for multi-bit addition');
      }
      
      if (parsed.name.includes('Multiplexer')) {
        suggestions.push('Try "demultiplexer" for signal distribution');
        suggestions.push('Consider "larger mux" for more inputs');
      }
      
      if (parsed.name.includes('Counter')) {
        suggestions.push('Try "down counter" for counting backwards');
        suggestions.push('Consider "up-down counter" for bidirectional counting');
      }

      return suggestions;
    }
  },

  // AI circuit optimizer
  optimizer: {
    name: 'circuit-optimizer',
    description: 'Optimizes circuits for minimal gate count and depth',
    
    optimize: (circuit) => {
      const optimizations = [];
      
      // Remove redundant gates
      const redundantGates = this.findRedundantGates(circuit);
      if (redundantGates.length > 0) {
        optimizations.push({
          type: 'redundant_gates',
          description: `Remove ${redundantGates.length} redundant gates`,
          nodesToRemove: redundantGates
        });
      }

      // Merge series gates
      const seriesOptimizations = this.findSeriesOptimizations(circuit);
      optimizations.push(...seriesOptimizations);

      // Simplify logic
      const logicSimplifications = this.simplifyLogic(circuit);
      optimizations.push(...logicSimplifications);

      return {
        originalCircuit: circuit,
        optimizations,
        optimizedCircuit: this.applyOptimizations(circuit, optimizations),
        improvement: this.calculateImprovement(circuit, optimizations)
      };
    },

    findRedundantGates: (circuit) => {
      const redundant = [];
      
      // Find gates with same inputs and outputs
      circuit.nodes.forEach((node1, i) => {
        if (node1.data.label !== 'AND' && node1.data.label !== 'OR') return;
        
        circuit.nodes.forEach((node2, j) => {
          if (i >= j) return; // Don't compare with self or earlier nodes
          
          if (node1.data.label === node2.data.label) {
            const inputs1 = circuit.edges.filter(e => e.target === node1.id).map(e => e.source);
            const inputs2 = circuit.edges.filter(e => e.target === node2.id).map(e => e.source);
            
            const outputs1 = circuit.edges.filter(e => e.source === node1.id).map(e => e.target);
            const outputs2 = circuit.edges.filter(e => e.source === node2.id).map(e => e.target);
            
            // Check if gates have identical inputs and outputs
            if (JSON.stringify(inputs1.sort()) === JSON.stringify(inputs2.sort()) &&
                JSON.stringify(outputs1.sort()) === JSON.stringify(outputs2.sort())) {
              redundant.push(node2.id);
            }
          }
        });
      });
      
      return redundant;
    },

    findSeriesOptimizations: (circuit) => {
      const optimizations = [];
      
      // Find AND-AND or OR-OR series that can be merged
      circuit.nodes.forEach(node => {
        if (node.data.label !== 'AND' && node.data.label !== 'OR') return;
        
        const outputs = circuit.edges.filter(e => e.source === node.id);
        const inputs = circuit.edges.filter(e => e.target === node.id);
        
        outputs.forEach(output => {
          const targetNode = circuit.nodes.find(n => n.id === output.target);
          if (targetNode && targetNode.data.label === node.data.label) {
            // Check if we can merge these gates
            const otherInputs = circuit.edges.filter(e => e.target === targetNode.id && e.source !== node.id);
            
            if (otherInputs.length === 1) {
              optimizations.push({
                type: 'series_merge',
                description: `Merge ${node.data.label}-${node.data.label} series`,
                node1Id: node.id,
                node2Id: targetNode.id,
                mergedType: node.data.label
              });
            }
          }
        });
      });
      
      return optimizations;
    },

    simplifyLogic: (circuit) => {
      const simplifications = [];
      
      // Apply Boolean algebra simplifications
      circuit.nodes.forEach(node => {
        if (node.data.label === 'AND') {
          // A AND A = A (idempotent law)
          const inputs = circuit.edges.filter(e => e.target === node.id).map(e => e.source);
          if (inputs.length === 2 && inputs[0] === inputs[1]) {
            const sourceNode = circuit.nodes.find(n => n.id === inputs[0]);
            if (sourceNode) {
              simplifications.push({
                type: 'idempotent',
                description: 'Remove redundant AND gate (A AND A = A)',
                nodeId: node.id,
                replacement: inputs[0]
              });
            }
          }
        }
        
        if (node.data.label === 'OR') {
          // A OR A = A (idempotent law)
          const inputs = circuit.edges.filter(e => e.target === node.id).map(e => e.source);
          if (inputs.length === 2 && inputs[0] === inputs[1]) {
            const sourceNode = circuit.nodes.find(n => n.id === inputs[0]);
            if (sourceNode) {
              simplifications.push({
                type: 'idempotent',
                description: 'Remove redundant OR gate (A OR A = A)',
                nodeId: node.id,
                replacement: inputs[0]
              });
            }
          }
        }
      });
      
      return simplifications;
    },

    applyOptimizations: (circuit, optimizations) => {
      let optimizedNodes = [...circuit.nodes];
      let optimizedEdges = [...circuit.edges];
      
      // Apply optimizations in order
      optimizations.forEach(optimization => {
        switch (optimization.type) {
          case 'redundant_gates':
            optimizedNodes = optimizedNodes.filter(n => !optimization.nodesToRemove.includes(n.id));
            optimizedEdges = optimizedEdges.filter(e => 
              !optimization.nodesToRemove.includes(e.source) && 
              !optimization.nodesToRemove.includes(e.target)
            );
            break;
            
          case 'series_merge':
            // This would require more complex restructuring
            break;
            
          case 'idempotent':
            // Replace gate with direct connection
            const gateNode = optimizedNodes.find(n => n.id === optimization.nodeId);
            if (gateNode) {
              optimizedEdges = optimizedEdges.filter(e => e.target !== optimization.nodeId);
              optimizedEdges.push({
                source: optimization.replacement,
                target: gateNode.data.outputs?.[0] || 'auto'
              });
            }
            optimizedNodes = optimizedNodes.filter(n => n.id !== optimization.nodeId);
            break;
        }
      });
      
      return {
        nodes: optimizedNodes,
        edges: optimizedEdges
      };
    },

    calculateImprovement: (original, optimizations) => {
      const gateReduction = optimizations.filter(o => o.type === 'redundant_gates').length;
      const logicSimplifications = optimizations.filter(o => o.type === 'idempotent').length;
      
      return {
        gateReduction,
        logicSimplifications,
        totalOptimizations: optimizations.length,
        estimatedComplexityReduction: (gateReduction * 0.8) + (logicSimplifications * 0.6)
      };
    }
  }
};

export default AICircuitPlugin;
