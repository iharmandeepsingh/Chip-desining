const SequentialCircuitPlugin = {
  name: 'Sequential Circuits',
  version: '1.0.0',
  type: 'gate',
  description: 'Adds sequential circuit components like Flip-Flops and Clock signals',

  gateTypes: [
    {
      type: 'D_FLIP_FLOP',
      name: 'D Flip-Flop',
      description: 'Data flip-flop with edge-triggered storage',
      category: 'sequential',
      inputs: ['D', 'CLK'],
      outputs: ['Q', 'Q_BAR'],
      compute: (inputs) => {
        const D = inputs.D || false;
        const CLK = inputs.CLK || false;
        
        // Simple D flip-flop logic
        // On rising edge of clock, Q follows D
        return {
          Q: CLK ? D : inputs.Q || false,
          Q_BAR: CLK ? !D : inputs.Q_BAR || true
        };
      },
      render: (node, theme) => ({
        id: node.id,
        type: 'gate',
        position: node.position,
        data: {
          ...node.data,
          label: 'D_FLIP_FLOP'
        },
        style: {
          backgroundColor: theme.gateColors.SEQUENTIAL || '#8B4513',
          border: `2px solid ${theme.gateColors.SEQUENTIAL || '#8B4513'}`,
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '120px',
          textAlign: 'center'
        }
      })
    },
    {
      type: 'JK_FLIP_FLOP',
      name: 'JK Flip-Flop',
      description: 'JK flip-flop with toggle functionality',
      category: 'sequential',
      inputs: ['J', 'K', 'CLK'],
      outputs: ['Q', 'Q_BAR'],
      compute: (inputs) => {
        const J = inputs.J || false;
        const K = inputs.K || false;
        const CLK = inputs.CLK || false;
        const Q_prev = inputs.Q || false;
        
        // JK flip-flop truth table
        let Q_next;
        if (CLK) {
          if (!J && !K) Q_next = false;        // Reset
          else if (!J && K) Q_next = Q_prev;       // No change
          else if (J && !K) Q_next = true;         // Set
          else if (J && K) Q_next = !Q_prev;      // Toggle
        } else {
          Q_next = Q_prev; // Hold
        }
        
        return {
          Q: Q_next,
          Q_BAR: !Q_next
        };
      },
      render: (node, theme) => ({
        id: node.id,
        type: 'gate',
        position: node.position,
        data: {
          ...node.data,
          label: 'JK_FLIP_FLOP'
        },
        style: {
          backgroundColor: theme.gateColors.SEQUENTIAL || '#8B4513',
          border: `2px solid ${theme.gateColors.SEQUENTIAL || '#8B4513'}`,
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '120px',
          textAlign: 'center'
        }
      })
    },
    {
      type: 'CLOCK',
      name: 'Clock Signal',
      description: 'Periodic clock signal generator',
      category: 'sequential',
      inputs: [],
      outputs: ['CLK'],
      compute: (inputs, state = { frequency: 1, phase: 0 }) => {
        // Simple clock generator
        const time = Date.now() / 1000; // Convert to seconds
        const period = 1 / state.frequency;
        const phase = (time + state.phase) % period;
        
        return {
          CLK: phase < period / 2
        };
      },
      render: (node, theme) => ({
        id: node.id,
        type: 'gate',
        position: node.position,
        data: {
          ...node.data,
          label: 'CLOCK',
          frequency: node.data.frequency || 1,
          phase: node.data.phase || 0
        },
        style: {
          backgroundColor: theme.gateColors.CLOCK || '#FF6B6B',
          border: `2px solid ${theme.gateColors.CLOCK || '#FF6B6B'}`,
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '120px',
          textAlign: 'center'
        }
      })
    },
    {
      type: 'COUNTER',
      name: 'Binary Counter',
      description: 'N-bit binary counter with clock input',
      category: 'sequential',
      inputs: ['CLK', 'RESET'],
      outputs: Array.from({ length: 4 }, (_, i) => `Q${i}`), // 4-bit counter
      compute: (inputs, state = { count: 0 }) => {
        const CLK = inputs.CLK || false;
        const RESET = inputs.RESET || false;
        
        let newCount = state.count;
        
        if (RESET) {
          newCount = 0;
        } else if (CLK && !inputs.CLK_prev) { // Rising edge
          newCount = (state.count + 1) % 16; // 4-bit counter (0-15)
        }
        
        const outputs = {};
        for (let i = 0; i < 4; i++) {
          outputs[`Q${i}`] = (newCount >> i) & 1;
        }
        
        return { ...outputs, count: newCount };
      },
      render: (node, theme) => ({
        id: node.id,
        type: 'gate',
        position: node.position,
        data: {
          ...node.data,
          label: 'COUNTER',
          count: node.data.count || 0
        },
        style: {
          backgroundColor: theme.gateColors.COUNTER || '#9C27B0',
          border: `2px solid ${theme.gateColors.COUNTER || '#9C27B0'}`,
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: '120px',
          textAlign: 'center'
        }
      })
    }
  ],

  // Sequential circuit simulation engine
  simulationEngine: {
    name: 'sequential',
    description: 'Handles sequential circuit simulation with state and timing',
    simulate: (circuit, deltaTime = 0) => {
      const nodes = circuit.nodes;
      const edges = circuit.edges;
      const sequentialNodes = nodes.filter(node => 
        ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER'].includes(node.data.label)
      );

      // Sort nodes by dependency order
      const nodeOrder = topologicalSort(nodes, edges);
      
      // Simulate each node
      const results = new Map();
      
      for (const nodeId of nodeOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // Get inputs for this node
        const inputs = {};
        edges.forEach(edge => {
          if (edge.target === nodeId) {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const sourceOutput = results.get(edge.source) || sourceNode.data.value;
            inputs[edge.targetHandle || 'default'] = sourceOutput;
          }
        });

        // Get current state for sequential nodes
        const currentState = results.get(nodeId) || {};
        
        // Compute outputs based on gate type
        let outputs;
        const gateType = this.gateTypes.find(gt => gt.type === node.data.label);
        if (gateType) {
          outputs = gateType.compute(inputs, currentState);
        }

        // Store results
        results.set(nodeId, outputs);
        
        // Update node data
        node.data.value = outputs;
        node.data.state = outputs; // Store full state for sequential nodes
      }

      return {
        nodes: Array.from(results.entries()).map(([id, outputs]) => {
          const node = nodes.find(n => n.id === id);
          return {
            ...node,
            data: {
              ...node.data,
              value: outputs,
              state: outputs
            }
          };
        }),
        edges: edges
      };
    }
  },

  // Timing simulation engine
  timingEngine: {
    name: 'timing',
    description: 'Handles timing-aware simulation with propagation delays',
    simulate: (circuit, deltaTime = 16) => { // 60 FPS default
      const nodes = circuit.nodes;
      const edges = circuit.edges;
      
      // Define propagation delays (in milliseconds)
      const delays = {
        'AND': 10,
        'OR': 10,
        'NOT': 5,
        'D_FLIP_FLOP': 20,
        'JK_FLIP_FLOP': 25,
        'CLOCK': 0,
        'COUNTER': 15
      };

      // Initialize timing state
      const timingState = new Map();
      nodes.forEach(node => {
        timingState.set(node.id, {
          lastChange: 0,
          propagationTime: 0,
          value: node.data.value || false
        });
      });

      // Calculate propagation times
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        const delay = delays[sourceNode?.data?.label] || 10;
        
        const sourceState = timingState.get(edge.source);
        const targetTime = sourceState.propagationTime + delay;
        
        const currentTargetState = timingState.get(edge.target);
        if (currentTargetState.propagationTime === 0 || targetTime < currentTargetState.propagationTime) {
          timingState.set(edge.target, {
            ...currentTargetState,
            propagationTime: targetTime
          });
        }
      });

      // Update node values based on propagation timing
      const currentTime = Date.now();
      const updatedNodes = nodes.map(node => {
        const state = timingState.get(node.id);
        if (state.propagationTime <= currentTime) {
          return {
            ...node,
            data: {
              ...node.data,
              value: state.value
            }
          };
        }
        return node;
      });

      return {
        nodes: updatedNodes,
        edges: edges,
        timing: Array.from(timingState.entries()).map(([id, state]) => ({
          nodeId: id,
          propagationTime: state.propagationTime,
          value: state.value
        }))
      };
    }
  }
};

// Helper function for topological sort
function topologicalSort(nodes, edges) {
  const graph = {};
  const inDegree = {};
  const result = [];
  
  // Initialize graph
  nodes.forEach(node => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });
  
  // Build graph and calculate in-degrees
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    }
  });
  
  // Queue nodes with no dependencies
  const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
  
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    
    graph[current].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}

export default SequentialCircuitPlugin;
