class SequentialLogicEngine {
  constructor() {
    this.clockSignals = new Map();
    this.memoryBlocks = new Map();
    this.stateMachines = new Map();
    this.propagationDelays = new Map();
    this.setupTimes = new Map();
    this.holdTimes = new Map();
    this.currentTime = 0;
    this.timeStep = 0.1; // 0.1ns time step
    this.pendingEvents = [];
    this.processedEvents = new Set();
  }

  // Initialize component timing specifications
  initializeComponent(node) {
    const { type, setupTime, holdTime, propagationDelay, accessTime, memorySize } = node.data;
    
    this.propagationDelays.set(node.id, propagationDelay || 5);
    this.setupTimes.set(node.id, setupTime || 2);
    this.holdTimes.set(node.id, holdTime || 1);
    
    if (memorySize) {
      this.memoryBlocks.set(node.id, new Array(memorySize).fill(0));
    }
    
    // Initialize state machines
    if (type.includes('STATE_MACHINE')) {
      this.stateMachines.set(node.id, {
        currentState: 'S0',
        previousState: 'S0',
        transitions: node.data.stateTransitions || [],
      });
    }
  }

  // Clock signal management
  updateClockSignal(clockNodeId, value) {
    const previousValue = this.clockSignals.get(clockNodeId) || false;
    this.clockSignals.set(clockNodeId, value);
    
    // Detect clock edges
    const edge = previousValue === false && value === true ? 'rising' : 
                 previousValue === true && value === false ? 'falling' : 'none';
    
    if (edge !== 'none') {
      this.scheduleClockEdgeEvent(clockNodeId, edge, this.currentTime);
    }
  }

  // Schedule clock edge events
  scheduleClockEdgeEvent(nodeId, edge, timestamp) {
    this.pendingEvents.push({
      type: 'clock_edge',
      nodeId,
      edge,
      timestamp,
      priority: 1, // High priority for clock events
    });
  }

  // Schedule propagation events
  schedulePropagationEvent(nodeId, value, timestamp) {
    const delay = this.propagationDelays.get(nodeId) || 5;
    this.pendingEvents.push({
      type: 'propagation',
      nodeId,
      value,
      timestamp: timestamp + delay,
      priority: 2,
    });
  }

  // Process sequential logic components
  processSequentialNode(node, inputs, timestamp) {
    const { type, currentState, memory } = node.data;
    
    switch (type) {
      case 'T_FLIP_FLOP':
        return this.processTFlipFlop(node, inputs, timestamp);
      
      case 'SR_FLIP_FLOP':
        return this.processSRFlipFlop(node, inputs, timestamp);
      
      case 'JK_FLIP_FLOP_EN':
        return this.processJKFlipFlopEnable(node, inputs, timestamp);
      
      case 'RAM_8BIT':
      case 'ROM_16BIT':
        return this.processMemory(node, inputs, timestamp);
      
      case 'REGISTER_8BIT':
        return this.processRegister(node, inputs, timestamp);
      
      case 'COUNTER_4BIT_SYNC':
      case 'COUNTER_8BIT':
        return this.processCounter(node, inputs, timestamp);
      
      case 'SHIFT_REGISTER_4BIT':
        return this.processShiftRegister(node, inputs, timestamp);
      
      case 'STATE_MACHINE_2BIT':
        return this.processStateMachine(node, inputs, timestamp);
      
      default:
        return this.processBasicSequential(node, inputs, timestamp);
    }
  }

  // T Flip-Flop: Q = Q_prev ⊕ T on clock edge
  processTFlipFlop(node, inputs, timestamp) {
    const { T, CLK } = inputs;
    const { currentState } = node.data;
    
    if (CLK === 'rising') {
      const nextState = T ? !currentState : currentState;
      this.schedulePropagationEvent(node.id, nextState, timestamp);
      return { Q: nextState, Q_: !nextState };
    }
    
    return { Q: currentState, Q_: !currentState };
  }

  // SR Flip-Flop: Standard SR latch behavior
  processSRFlipFlop(node, inputs, timestamp) {
    const { S, R, CLK } = inputs;
    const { currentState } = node.data;
    
    if (CLK === 'rising') {
      let nextState;
      if (S === 0 && R === 0) {
        nextState = currentState; // No change
      } else if (S === 0 && R === 1) {
        nextState = 0; // Reset
      } else if (S === 1 && R === 0) {
        nextState = 1; // Set
      } else if (S === 1 && R === 1) {
        nextState = 'X'; // Invalid/undefined state
      }
      
      this.schedulePropagationEvent(node.id, nextState, timestamp);
      return { Q: nextState, Q_: nextState === 'X' ? 'X' : !nextState };
    }
    
    return { Q: currentState, Q_: !currentState };
  }

  // JK Flip-Flop with Enable
  processJKFlipFlopEnable(node, inputs, timestamp) {
    const { J, K, CLK, EN } = inputs;
    const { currentState } = node.data;
    
    if (CLK === 'rising' && EN) {
      let nextState;
      if (J === 0 && K === 0) {
        nextState = currentState; // No change
      } else if (J === 0 && K === 1) {
        nextState = 0; // Reset
      } else if (J === 1 && K === 0) {
        nextState = 1; // Set
      } else if (J === 1 && K === 1) {
        nextState = !currentState; // Toggle
      }
      
      this.schedulePropagationEvent(node.id, nextState, timestamp);
      return { Q: nextState, Q_: !nextState };
    }
    
    return { Q: currentState, Q_: !currentState };
  }

  // Memory blocks (RAM/ROM)
  processMemory(node, inputs, timestamp) {
    const { ADDR, DATA_IN, WE, OE } = inputs;
    const { memory, dataWidth } = node.data;
    const address = this.parseBusValue(ADDR);
    
    if (OE && address < memory.length) {
      let dataOut;
      if (WE && DATA_IN !== undefined) {
        // Write operation
        memory[address] = this.parseBusValue(DATA_IN);
        dataOut = memory[address];
      } else {
        // Read operation
        dataOut = memory[address];
      }
      
      const accessTime = node.data.accessTime || 12;
      this.schedulePropagationEvent(node.id, dataOut, timestamp + accessTime);
      return { DATA_OUT: this.formatBusValue(dataOut, dataWidth) };
    }
    
    return { DATA_OUT: 0 };
  }

  // Parallel register
  processRegister(node, inputs, timestamp) {
    const { DATA_IN, CLK, CLR } = inputs;
    const { currentState } = node.data;
    
    if (CLR) {
      this.schedulePropagationEvent(node.id, 0, timestamp);
      return { DATA_OUT: 0 };
    }
    
    if (CLK === 'rising') {
      this.schedulePropagationEvent(node.id, DATA_IN, timestamp);
      return { DATA_OUT: DATA_IN };
    }
    
    return { DATA_OUT: currentState };
  }

  // Counter implementation
  processCounter(node, inputs, timestamp) {
    const { CLK, CLR, LOAD, DATA_IN, UP_DN } = inputs;
    const { currentState, maxValue } = node.data;
    
    let nextState;
    
    if (CLR) {
      nextState = 0;
    } else if (CLK === 'rising') {
      if (LOAD !== undefined) {
        nextState = DATA_IN;
      } else {
        const direction = UP_DN !== undefined ? UP_DN : true;
        if (direction) {
          nextState = (currentState + 1) % (maxValue + 1);
        } else {
          nextState = currentState === 0 ? maxValue : currentState - 1;
        }
      }
    } else {
      nextState = currentState;
    }
    
    const rco = (nextState === maxValue && UP_DN !== false) ? 1 : 0;
    
    this.schedulePropagationEvent(node.id, nextState, timestamp);
    return { Q: nextState, RCO: rco };
  }

  // Shift register
  processShiftRegister(node, inputs, timestamp) {
    const { SER_IN, CLK, CLR, SHIFT_LOAD } = inputs;
    const { currentState } = node.data;
    
    if (CLR) {
      this.schedulePropagationEvent(node.id, 0, timestamp);
      return { Q: 0 };
    }
    
    if (CLK === 'rising') {
      let nextState;
      if (SHIFT_LOAD) {
        // Load parallel data
        nextState = DATA_IN;
      } else {
        // Shift operation
        nextState = (currentState << 1) | (SER_IN & 1);
      }
      
      this.schedulePropagationEvent(node.id, nextState, timestamp);
      return { Q: nextState };
    }
    
    return { Q: currentState };
  }

  // State machine processor
  processStateMachine(node, inputs, timestamp) {
    const { X, CLK, RESET } = inputs;
    const stateMachine = this.stateMachines.get(node.id);
    
    if (RESET) {
      stateMachine.currentState = 'S0';
      this.schedulePropagationEvent(node.id, 'S0', timestamp);
      return { Y: 0, STATE: 'S0' };
    }
    
    if (CLK === 'rising') {
      const transitions = stateMachine.transitions;
      const transition = transitions.find(t => 
        t.from === stateMachine.currentState && t.input === X
      );
      
      if (transition) {
        stateMachine.currentState = transition.to;
        this.schedulePropagationEvent(node.id, transition.output, timestamp);
        return { Y: transition.output, STATE: transition.to };
      }
    }
    
    const currentTransition = stateMachine.transitions.find(t => 
      t.from === stateMachine.currentState
    );
    return { Y: currentTransition?.output || 0, STATE: stateMachine.currentState };
  }

  // Basic sequential logic fallback
  processBasicSequential(node, inputs, timestamp) {
    const { CLK } = inputs;
    const { currentState } = node.data;
    
    if (CLK === 'rising') {
      // Simple clocked behavior
      const nextState = inputs.DATA_IN !== undefined ? inputs.DATA_IN : currentState;
      this.schedulePropagationEvent(node.id, nextState, timestamp);
      return { Q: nextState };
    }
    
    return { Q: currentState };
  }

  // Utility functions for bus operations
  parseBusValue(busValue) {
    if (typeof busValue === 'string') {
      // Parse bus notation like "ADDR[7:0]"
      return parseInt(busValue, 2);
    }
    return busValue || 0;
  }

  formatBusValue(value, width) {
    return value & ((1 << width) - 1);
  }

  // Main simulation step
  simulateStep(nodes, edges, deltaTime) {
    this.currentTime += deltaTime;
    
    // Sort events by timestamp and priority
    this.pendingEvents.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.priority - b.priority;
    });
    
    // Process events up to current time
    const eventsToProcess = this.pendingEvents.filter(
      event => event.timestamp <= this.currentTime
    );
    
    const results = new Map();
    
    eventsToProcess.forEach(event => {
      if (this.processedEvents.has(event)) return;
      
      const node = nodes.find(n => n.id === event.nodeId);
      if (!node) return;
      
      // Get inputs for this node
      const inputs = this.getNodeInputs(node, edges, results);
      
      // Process the node
      const outputs = this.processSequentialNode(node, inputs, event.timestamp);
      results.set(node.id, outputs);
      
      this.processedEvents.add(event);
    });
    
    // Remove processed events
    this.pendingEvents = this.pendingEvents.filter(
      event => !this.processedEvents.has(event)
    );
    
    return results;
  }

  // Get node inputs considering timing
  getNodeInputs(node, edges, currentResults) {
    const inputEdges = edges.filter(e => e.target === node.id);
    const inputs = {};
    
    inputEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        const sourceResults = currentResults.get(edge.source);
        if (sourceResults) {
          // Use the most recent output
          inputs[edge.sourceHandle || 'data'] = Object.values(sourceResults)[0];
        } else {
          // Use current state
          inputs[edge.sourceHandle || 'data'] = sourceNode.data.value;
        }
      }
    });
    
    return inputs;
  }

  // Reset simulation state
  reset() {
    this.currentTime = 0;
    this.pendingEvents = [];
    this.processedEvents.clear();
    this.clockSignals.clear();
    this.memoryBlocks.forEach((memory, nodeId) => {
      memory.fill(0);
    });
    this.stateMachines.forEach((stateMachine, nodeId) => {
      stateMachine.currentState = 'S0';
    });
  }
}

export default SequentialLogicEngine;
