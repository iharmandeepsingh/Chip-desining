import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import pluginLoader from '../plugins/PluginLoader.js';
import SequentialLogicEngine from '../simulation/SequentialLogicEngine.jsx';

const useCircuitStore = create(
  subscribeWithSelector((set, get) => ({
    // Circuit state
    nodes: [],
    edges: [],
    
    // Animation state
    animatingEdges: new Set(),
    propagationQueue: [],
    isAnimating: false,
    
    // Sequential logic engine
    sequentialEngine: new SequentialLogicEngine(),
    currentTime: 0,
    simulationMode: 'functional', // 'functional', 'timing', 'step'
    timingEnabled: false,
    
    // History for undo/redo
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,
    
    // Actions
    addNode: (node) => set((state) => ({ 
      nodes: [...state.nodes, node] 
    })),
    
    updateNode: (id, updates) => set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    })),
    
    addEdge: (edge) => set((state) => ({ 
      edges: [...state.edges, edge] 
    })),
    
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    
    // Simulation logic
    computeNodeValue: (nodeId) => {
      const { nodes, edges } = get();
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return false;
      
      const inputs = edges
        .filter(e => e.target === nodeId)
        .map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          return sourceNode?.data?.value ?? false;
        });
      
      switch (node.data.label) {
        case 'INPUT':
          return node.data.value;
        case 'AND':
          return inputs.length >= 2 ? inputs.every(Boolean) : false;
        case 'OR':
          return inputs.some(Boolean);
        case 'NOT':
          return inputs.length === 1 ? !inputs[0] : false;
        case 'OUTPUT':
          return inputs.length > 0 ? inputs[0] : false;
        default:
          return false;
      }
    },
    
    // Propagate values through circuit
    propagateValues: () => {
      const { nodes, edges, computeNodeValue, updateNode } = get();
      const nodeOrder = topologicalSort(nodes, edges);
      
      // Compute values in dependency order
      nodeOrder.forEach(nodeId => {
        const newValue = computeNodeValue(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.data.value !== newValue) {
          updateNode(nodeId, { 
            data: { ...node.data, value: newValue }
          });
        }
      });
    },
    
    // Toggle input value
    toggleInput: (nodeId) => {
      const { nodes, updateNode, animatePropagation } = get();
      const node = nodes.find(n => n.id === nodeId);
      
      if (node && node.data.label === 'INPUT') {
        const newValue = !node.data.value;
        updateNode(nodeId, { 
          data: { ...node.data, value: newValue }
        });
        
        // Animate propagation through the circuit
        animatePropagation(nodeId);
      }
    },

    // Animated signal propagation
    animatePropagation: (startNodeId) => {
      const { nodes, edges, computeNodeValue, updateNode } = get();
      const nodeOrder = topologicalSort(nodes, edges);
      const startIndex = nodeOrder.indexOf(startNodeId);
      
      if (startIndex === -1) return;
      
      // Start animation
      set({ isAnimating: true, animatingEdges: new Set() });
      
      // Process nodes in order with delays
      nodeOrder.slice(startIndex).forEach((nodeId, index) => {
        setTimeout(() => {
          const newValue = computeNodeValue(nodeId);
          const node = nodes.find(n => n.id === nodeId);
          
          if (node && node.data.value !== newValue) {
            // Highlight incoming edges
            const incomingEdges = edges.filter(e => e.target === nodeId);
            incomingEdges.forEach(edge => {
              set(state => ({
                animatingEdges: new Set([...state.animatingEdges, edge.id])
              }));
            });
            
            // Update node value
            updateNode(nodeId, { 
              data: { ...node.data, value: newValue }
            });
            
            // Clear edge highlighting after animation
            setTimeout(() => {
              set(state => {
                const newAnimatingEdges = new Set(state.animatingEdges);
                incomingEdges.forEach(edge => {
                  newAnimatingEdges.delete(edge.id);
                });
                return { animatingEdges: newAnimatingEdges };
              });
            }, 300);
          }
          
          // End animation when complete
          if (index === nodeOrder.slice(startIndex).length - 1) {
            setTimeout(() => set({ isAnimating: false }), 300);
          }
        }, index * 200); // 200ms delay between each node
      });
    },

    // Step-by-step propagation
    stepPropagation: (nodeId) => {
      const { nodes, edges, computeNodeValue, updateNode } = get();
      const node = nodes.find(n => n.id === nodeId);
      
      if (!node) return;
      
      const newValue = computeNodeValue(nodeId);
      if (node.data.value !== newValue) {
        // Highlight incoming edges
        const incomingEdges = edges.filter(e => e.target === nodeId);
        incomingEdges.forEach(edge => {
          set(state => ({
            animatingEdges: new Set([...state.animatingEdges, edge.id])
          }));
        });
        
        updateNode(nodeId, { 
          data: { ...node.data, value: newValue }
        });
        
        // Clear edge highlighting after delay
        setTimeout(() => {
          set(state => {
            const newAnimatingEdges = new Set(state.animatingEdges);
            incomingEdges.forEach(edge => {
              newAnimatingEdges.delete(edge.id);
            });
            return { animatingEdges: newAnimatingEdges };
          });
        }, 500);
      }
    },
    
    // Save state to history
    saveToHistory: () => {
      const { nodes, edges, history, historyIndex, maxHistorySize } = get();
      const currentState = { nodes: [...nodes], edges: [...edges] };
      
      // Remove any states after current index
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      set({ 
        history: newHistory, 
        historyIndex: newHistory.length - 1 
      });
    },
    
    // Undo functionality
    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const state = history[newIndex];
        set({
          nodes: state.nodes,
          edges: state.edges,
          historyIndex: newIndex
        });
      }
    },
    
    // Redo functionality
    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        const state = history[newIndex];
        set({
          nodes: state.nodes,
          edges: state.edges,
          historyIndex: newIndex
        });
      }
    },
    
    // Check if undo is available
    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },
    
    // Check if redo is available
    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },
    
    // Clear circuit
    clearCircuit: () => {
      const { saveToHistory, sequentialEngine } = get();
      saveToHistory();
      sequentialEngine.reset();
      set({ nodes: [], edges: [] });
    },
    
    // Enhanced sequential simulation
    simulateSequentialStep: (deltaTime = 0.1) => {
      const { nodes, edges, sequentialEngine, updateNode } = get();
      
      // Initialize sequential components
      nodes.forEach(node => {
        if (!sequentialEngine.propagationDelays.has(node.id)) {
          sequentialEngine.initializeComponent(node);
        }
      });
      
      // Run one simulation step
      const results = sequentialEngine.simulateStep(nodes, edges, deltaTime);
      
      // Apply results to nodes
      results.forEach((outputs, nodeId) => {
        updateNode(nodeId, { 
          data: { ...nodes.find(n => n.id === nodeId).data, ...outputs }
        });
      });
      
      // Update current time
      set({ currentTime: sequentialEngine.currentTime });
    },
    
    // Toggle timing simulation mode
    toggleTimingMode: () => {
      const { timingEnabled, sequentialEngine } = get();
      const newTimingEnabled = !timingEnabled;
      
      if (newTimingEnabled) {
        sequentialEngine.reset();
      }
      
      set({ timingEnabled: newTimingEnabled });
    },
    
    // Set simulation mode
    setSimulationMode: (mode) => {
      const { sequentialEngine } = get();
      sequentialEngine.reset();
      set({ simulationMode: mode });
    },
    
    // Update clock signal
    updateClockSignal: (nodeId, value) => {
      const { sequentialEngine, updateNode } = get();
      sequentialEngine.updateClockSignal(nodeId, value);
      updateNode(nodeId, { 
        data: { ...nodes.find(n => n.id === nodeId).data, value }
      });
    },
    
    // Get timing information
    getTimingInfo: (nodeId) => {
      const { sequentialEngine } = get();
      return {
        propagationDelay: sequentialEngine.propagationDelays.get(nodeId),
        setupTime: sequentialEngine.setupTimes.get(nodeId),
        holdTime: sequentialEngine.holdTimes.get(nodeId),
      };
    },
    
    // Plugin system integration
    getAvailableGateTypes: () => pluginLoader.getAvailableGateTypes(),
    getAvailableSimulationEngines: () => pluginLoader.getAvailableSimulationEngines(),
    getAvailableValidators: () => pluginLoader.getAvailableValidators(),
    getAvailableExporters: () => pluginLoader.getAvailableExporters(),
    
    // Plugin management
    setSimulationEngine: (engineName) => pluginLoader.setSimulationEngine(engineName),
    setValidator: (validatorName) => pluginLoader.setValidator(validatorName),
    setExporter: (exporterName) => pluginLoader.setExporter(exporterName),
    
    // Advanced simulation with plugins
    simulateWithEngine: (circuit, engineName, options = {}) => pluginLoader.simulate(circuit, { engine: engineName, ...options }),
    validateWithValidator: (circuit, validatorName, options = {}) => pluginLoader.validate(circuit, { validator: validatorName, ...options }),
    exportWithExporter: (circuit, exporterName, format, options = {}) => pluginLoader.export(circuit, exporterName, format, { ...options }),
    
    // AI circuit generation
    generateCircuit: (description, options = {}) => pluginLoader.generateCircuit(description, options),
    
    // Circuit optimization
    optimizeCircuit: (circuit, options = {}) => {
      const aiPlugin = pluginLoader.getPlugin('AI Circuit Generator');
      if (aiPlugin && aiPlugin.optimizer) {
        return aiPlugin.optimizer.optimize(circuit, options);
      }
      return null;
    },
  }))
);

// Helper function for topological sort to ensure proper propagation order
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

export default useCircuitStore;