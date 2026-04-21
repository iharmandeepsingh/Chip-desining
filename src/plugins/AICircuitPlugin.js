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
      
      // Enhanced circuit patterns with medium and complex circuits
      const patterns = [
        // BASIC CIRCUITS
        {
          keywords: ['half adder', 'sum', 'add two bits'],
          complexity: 'basic',
          generate: () => ({
            type: 'combinational',
            name: 'Half Adder',
            description: 'Adds two single bits with sum and carry',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 100, y: 100 } },
              { type: 'INPUT', label: 'B', position: { x: 100, y: 200 } },
              { type: 'XOR', label: 'XOR1', position: { x: 250, y: 150 } },
              { type: 'AND', label: 'AND1', position: { x: 250, y: 250 } },
              { type: 'OUTPUT', label: 'Sum', position: { x: 400, y: 150 } },
              { type: 'OUTPUT', label: 'Carry', position: { x: 400, y: 250 } }
            ],
            edges: [
              { source: 'A', target: 'XOR1' },
              { source: 'B', target: 'XOR1' },
              { source: 'A', target: 'AND1' },
              { source: 'B', target: 'AND1' },
              { source: 'XOR1', target: 'Sum' },
              { source: 'AND1', target: 'Carry' }
            ]
          })
        },
        {
          keywords: ['full adder', 'add three bits', '3-bit adder'],
          complexity: 'basic',
          generate: () => ({
            type: 'combinational',
            name: 'Full Adder',
            description: 'Adds three single bits with sum and carry',
            nodes: [
              { type: 'INPUT', label: 'A', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'B', position: { x: 50, y: 200 } },
              { type: 'INPUT', label: 'Cin', position: { x: 50, y: 300 } },
              { type: 'XOR', label: 'XOR1', position: { x: 200, y: 150 } },
              { type: 'AND', label: 'AND1', position: { x: 200, y: 250 } },
              { type: 'XOR', label: 'XOR2', position: { x: 350, y: 150 } },
              { type: 'OR', label: 'OR1', position: { x: 350, y: 250 } },
              { type: 'OUTPUT', label: 'Sum', position: { x: 500, y: 150 } },
              { type: 'OUTPUT', label: 'Cout', position: { x: 500, y: 250 } }
            ],
            edges: [
              { source: 'A', target: 'XOR1' },
              { source: 'B', target: 'XOR1' },
              { source: 'A', target: 'AND1' },
              { source: 'B', target: 'AND1' },
              { source: 'XOR1', target: 'XOR2' },
              { source: 'Cin', target: 'XOR2' },
              { source: 'AND1', target: 'OR1' },
              { source: 'XOR2', target: 'Sum' },
              { source: 'OR1', target: 'Cout' }
            ]
          })
        },
        
        // MEDIUM COMPLEXITY CIRCUITS
        {
          keywords: ['ripple carry adder', '4-bit adder', 'multi-bit adder'],
          complexity: 'medium',
          generate: () => ({
            type: 'combinational',
            name: '4-bit Ripple Carry Adder',
            description: 'Adds two 4-bit numbers with carry propagation',
            nodes: [
              // Inputs
              { type: 'INPUT', label: 'A0', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'A1', position: { x: 50, y: 150 } },
              { type: 'INPUT', label: 'A2', position: { x: 50, y: 200 } },
              { type: 'INPUT', label: 'A3', position: { x: 50, y: 250 } },
              { type: 'INPUT', label: 'B0', position: { x: 50, y: 350 } },
              { type: 'INPUT', label: 'B1', position: { x: 50, y: 400 } },
              { type: 'INPUT', label: 'B2', position: { x: 50, y: 450 } },
              { type: 'INPUT', label: 'B3', position: { x: 50, y: 500 } },
              { type: 'INPUT', label: 'Cin', position: { x: 50, y: 600 } },
              
              // Full Adders
              { type: 'FULL_ADDER', label: 'FA0', position: { x: 250, y: 200 } },
              { type: 'FULL_ADDER', label: 'FA1', position: { x: 250, y: 300 } },
              { type: 'FULL_ADDER', label: 'FA2', position: { x: 250, y: 400 } },
              { type: 'FULL_ADDER', label: 'FA3', position: { x: 250, y: 500 } },
              
              // Outputs
              { type: 'OUTPUT', label: 'S0', position: { x: 450, y: 200 } },
              { type: 'OUTPUT', label: 'S1', position: { x: 450, y: 300 } },
              { type: 'OUTPUT', label: 'S2', position: { x: 450, y: 400 } },
              { type: 'OUTPUT', label: 'S3', position: { x: 450, y: 500 } },
              { type: 'OUTPUT', label: 'Cout', position: { x: 450, y: 600 } }
            ],
            edges: [
              // Bit 0
              { source: 'A0', target: 'FA0' },
              { source: 'B0', target: 'FA0' },
              { source: 'Cin', target: 'FA0' },
              { source: 'FA0', target: 'S0' },
              
              // Bit 1
              { source: 'A1', target: 'FA1' },
              { source: 'B1', target: 'FA1' },
              { source: 'FA0', target: 'FA1' },
              { source: 'FA1', target: 'S1' },
              
              // Bit 2
              { source: 'A2', target: 'FA2' },
              { source: 'B2', target: 'FA2' },
              { source: 'FA1', target: 'FA2' },
              { source: 'FA2', target: 'S2' },
              
              // Bit 3
              { source: 'A3', target: 'FA3' },
              { source: 'B3', target: 'FA3' },
              { source: 'FA2', target: 'FA3' },
              { source: 'FA3', target: 'S3' },
              { source: 'FA3', target: 'Cout' }
            ]
          })
        },
        {
          keywords: ['multiplexer', 'mux', 'selector', '4 to 1 mux', '8 to 1 mux'],
          complexity: 'medium',
          generate: () => {
            const size = lowerDesc.includes('8') ? 8 : 4;
            const nodes = [];
            const edges = [];
            
            // Create inputs
            for (let i = 0; i < size; i++) {
              nodes.push({ type: 'INPUT', label: `I${i}`, position: { x: 50, y: 100 + i * 50 } });
            }
            
            // Create selector inputs
            const selectorBits = Math.log2(size);
            for (let i = 0; i < selectorBits; i++) {
              nodes.push({ type: 'INPUT', label: `S${i}`, position: { x: 50, y: 600 + i * 50 } });
            }
            
            // Create output
            nodes.push({ type: 'OUTPUT', label: 'Y', position: { x: 500, y: 350 } });
            
            // Add decoder and AND gates (simplified representation)
            nodes.push({ type: 'DECODER', label: 'DEC', position: { x: 200, y: 650 } });
            nodes.push({ type: 'MULTIPLEXER_CORE', label: 'MUX_CORE', position: { x: 350, y: 350 } });
            
            // Connect inputs to core
            for (let i = 0; i < size; i++) {
              edges.push({ source: `I${i}`, target: 'MUX_CORE' });
            }
            
            // Connect selectors to decoder
            for (let i = 0; i < selectorBits; i++) {
              edges.push({ source: `S${i}`, target: 'DEC' });
            }
            
            // Connect decoder to core and output
            edges.push({ source: 'DEC', target: 'MUX_CORE' });
            edges.push({ source: 'MUX_CORE', target: 'Y' });
            
            return {
              type: 'combinational',
              name: `${size}-to-1 Multiplexer`,
              description: `Selects one of ${size} inputs based on ${selectorBits} selector bits`,
              nodes,
              edges
            };
          }
        },
        {
          keywords: ['decoder', 'binary decoder', '3 to 8 decoder', '4 to 16 decoder'],
          complexity: 'medium',
          generate: () => {
            const inputBits = lowerDesc.includes('4') ? 4 : (lowerDesc.includes('8') ? 3 : 2);
            const outputBits = Math.pow(2, inputBits);
            const nodes = [];
            const edges = [];
            
            // Create inputs
            for (let i = 0; i < inputBits; i++) {
              nodes.push({ type: 'INPUT', label: `A${i}`, position: { x: 50, y: 100 + i * 100 } });
            }
            
            // Create outputs
            for (let i = 0; i < outputBits; i++) {
              nodes.push({ type: 'OUTPUT', label: `Y${i}`, position: { x: 500, y: 50 + i * 60 } });
            }
            
            // Add decoder core
            nodes.push({ type: 'DECODER_CORE', label: 'DEC_CORE', position: { x: 250, y: 250 } });
            
            // Connect inputs to decoder
            for (let i = 0; i < inputBits; i++) {
              edges.push({ source: `A${i}`, target: 'DEC_CORE' });
            }
            
            // Connect decoder to outputs
            for (let i = 0; i < outputBits; i++) {
              edges.push({ source: 'DEC_CORE', target: `Y${i}` });
            }
            
            return {
              type: 'combinational',
              name: `${inputBits}-to-${outputBits} Decoder`,
              description: `Decodes ${inputBits}-bit binary to ${outputBits} individual outputs`,
              nodes,
              edges
            };
          }
        },
        
        // COMPLEX CIRCUITS
        {
          keywords: ['alu', 'arithmetic logic unit', 'processor', 'cpu'],
          complexity: 'complex',
          generate: () => ({
            type: 'combinational',
            name: '4-bit ALU',
            description: 'Arithmetic Logic Unit with multiple operations',
            nodes: [
              // Data inputs
              { type: 'INPUT', label: 'A0', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'A1', position: { x: 50, y: 150 } },
              { type: 'INPUT', label: 'A2', position: { x: 50, y: 200 } },
              { type: 'INPUT', label: 'A3', position: { x: 50, y: 250 } },
              { type: 'INPUT', label: 'B0', position: { x: 50, y: 350 } },
              { type: 'INPUT', label: 'B1', position: { x: 50, y: 400 } },
              { type: 'INPUT', label: 'B2', position: { x: 50, y: 450 } },
              { type: 'INPUT', label: 'B3', position: { x: 50, y: 500 } },
              
              // Control inputs
              { type: 'INPUT', label: 'OP0', position: { x: 50, y: 600 } },
              { type: 'INPUT', label: 'OP1', position: { x: 50, y: 650 } },
              { type: 'INPUT', label: 'Cin', position: { x: 50, y: 700 } },
              
              // ALU components
              { type: 'ADDER_UNIT', label: 'ADD', position: { x: 200, y: 200 } },
              { type: 'SUBTRACTOR_UNIT', label: 'SUB', position: { x: 200, y: 350 } },
              { type: 'AND_UNIT', label: 'AND_LOGIC', position: { x: 200, y: 500 } },
              { type: 'OR_UNIT', label: 'OR_LOGIC', position: { x: 200, y: 650 } },
              { type: 'MUX_UNIT', label: 'SELECTOR', position: { x: 350, y: 400 } },
              
              // Outputs
              { type: 'OUTPUT', label: 'OUT0', position: { x: 500, y: 300 } },
              { type: 'OUTPUT', label: 'OUT1', position: { x: 500, y: 350 } },
              { type: 'OUTPUT', label: 'OUT2', position: { x: 500, y: 400 } },
              { type: 'OUTPUT', label: 'OUT3', position: { x: 500, y: 450 } },
              { type: 'OUTPUT', label: 'Cout', position: { x: 500, y: 550 } },
              { type: 'OUTPUT', label: 'Zero', position: { x: 500, y: 600 } }
            ],
            edges: [
              // Connect A inputs to all units
              { source: 'A0', target: 'ADD' }, { source: 'A1', target: 'ADD' },
              { source: 'A2', target: 'ADD' }, { source: 'A3', target: 'ADD' },
              { source: 'A0', target: 'SUB' }, { source: 'A1', target: 'SUB' },
              { source: 'A2', target: 'SUB' }, { source: 'A3', target: 'SUB' },
              { source: 'A0', target: 'AND_LOGIC' }, { source: 'A1', target: 'AND_LOGIC' },
              { source: 'A2', target: 'AND_LOGIC' }, { source: 'A3', target: 'AND_LOGIC' },
              { source: 'A0', target: 'OR_LOGIC' }, { source: 'A1', target: 'OR_LOGIC' },
              { source: 'A2', target: 'OR_LOGIC' }, { source: 'A3', target: 'OR_LOGIC' },
              
              // Connect B inputs to all units
              { source: 'B0', target: 'ADD' }, { source: 'B1', target: 'ADD' },
              { source: 'B2', target: 'ADD' }, { source: 'B3', target: 'ADD' },
              { source: 'B0', target: 'SUB' }, { source: 'B1', target: 'SUB' },
              { source: 'B2', target: 'SUB' }, { source: 'B3', target: 'SUB' },
              { source: 'B0', target: 'AND_LOGIC' }, { source: 'B1', target: 'AND_LOGIC' },
              { source: 'B2', target: 'AND_LOGIC' }, { source: 'B3', target: 'AND_LOGIC' },
              { source: 'B0', target: 'OR_LOGIC' }, { source: 'B1', target: 'OR_LOGIC' },
              { source: 'B2', target: 'OR_LOGIC' }, { source: 'B3', target: 'OR_LOGIC' },
              
              // Connect control to selector
              { source: 'OP0', target: 'SELECTOR' },
              { source: 'OP1', target: 'SELECTOR' },
              { source: 'Cin', target: 'ADD' },
              
              // Connect units to selector
              { source: 'ADD', target: 'SELECTOR' },
              { source: 'SUB', target: 'SELECTOR' },
              { source: 'AND_LOGIC', target: 'SELECTOR' },
              { source: 'OR_LOGIC', target: 'SELECTOR' },
              
              // Connect selector to outputs
              { source: 'SELECTOR', target: 'OUT0' },
              { source: 'SELECTOR', target: 'OUT1' },
              { source: 'SELECTOR', target: 'OUT2' },
              { source: 'SELECTOR', target: 'OUT3' },
              { source: 'SELECTOR', target: 'Cout' },
              { source: 'SELECTOR', target: 'Zero' }
            ]
          })
        },
        {
          keywords: ['register', 'flip flop', 'd flip flop', 'jk flip flop', 'memory'],
          complexity: 'medium',
          generate: () => {
            const flipFlopType = lowerDesc.includes('jk') ? 'JK' : (lowerDesc.includes('t') ? 'T' : 'D');
            const bits = lowerDesc.includes('4') ? 4 : (lowerDesc.includes('8') ? 8 : 1);
            const nodes = [];
            const edges = [];
            
            // Create clock
            nodes.push({ type: 'CLOCK', label: 'CLK', position: { x: 50, y: 100 } });
            
            // Create data inputs for multi-bit register
            if (bits > 1) {
              for (let i = 0; i < bits; i++) {
                nodes.push({ type: 'INPUT', label: `D${i}`, position: { x: 50, y: 200 + i * 50 } });
              }
            } else {
              nodes.push({ type: 'INPUT', label: 'D', position: { x: 50, y: 200 } });
            }
            
            // Create flip-flops
            for (let i = 0; i < bits; i++) {
              nodes.push({ 
                type: `${flipFlopType}_FLIP_FLOP`, 
                label: `FF${i}`, 
                position: { x: 250, y: 200 + i * 80 } 
              });
            }
            
            // Create outputs
            for (let i = 0; i < bits; i++) {
              nodes.push({ type: 'OUTPUT', label: `Q${i}`, position: { x: 450, y: 200 + i * 80 } });
              nodes.push({ type: 'OUTPUT', label: `Q${i}BAR`, position: { x: 450, y: 240 + i * 80 } });
            }
            
            // Connect clock to all flip-flops
            for (let i = 0; i < bits; i++) {
              edges.push({ source: 'CLK', target: `FF${i}` });
            }
            
            // Connect data inputs to flip-flops
            if (bits > 1) {
              for (let i = 0; i < bits; i++) {
                edges.push({ source: `D${i}`, target: `FF${i}` });
                edges.push({ source: `FF${i}`, target: `Q${i}` });
                edges.push({ source: `FF${i}`, target: `Q${i}BAR` });
              }
            } else {
              edges.push({ source: 'D', target: 'FF0' });
              edges.push({ source: 'FF0', target: 'Q0' });
              edges.push({ source: 'FF0', target: 'Q0BAR' });
            }
            
            return {
              type: 'sequential',
              name: `${bits}-bit ${flipFlopType} Register`,
              description: `${bits}-bit storage register using ${flipFlopType} flip-flops`,
              nodes,
              edges
            };
          }
        },
        {
          keywords: ['counter', 'binary counter', 'up counter', 'down counter', 'synchronous counter'],
          complexity: 'medium',
          generate: () => {
            const bits = lowerDesc.includes('8') ? 8 : (lowerDesc.includes('2') ? 2 : 4);
            const upDown = lowerDesc.includes('down') ? 'UP_DOWN' : 'UP';
            const synchronous = lowerDesc.includes('synchronous');
            const nodes = [];
            const edges = [];
            
            // Clock and control
            nodes.push({ type: 'CLOCK', label: 'CLK', position: { x: 50, y: 100 } });
            if (upDown === 'UP_DOWN') {
              nodes.push({ type: 'INPUT', label: 'DIR', position: { x: 50, y: 150 } });
            }
            nodes.push({ type: 'INPUT', label: 'RESET', position: { x: 50, y: 200 } });
            
            // Create counter flip-flops
            for (let i = 0; i < bits; i++) {
              nodes.push({ 
                type: 'T_FLIP_FLOP', 
                label: `CNT${i}`, 
                position: { x: 200 + i * 100, y: 150 } 
              });
            }
            
            // Create outputs
            for (let i = 0; i < bits; i++) {
              nodes.push({ type: 'OUTPUT', label: `Q${i}`, position: { x: 200 + i * 100, y: 300 } });
            }
            
            // Connect clock to all flip-flops
            for (let i = 0; i < bits; i++) {
              edges.push({ source: 'CLK', target: `CNT${i}` });
            }
            
            // Connect reset to all flip-flops
            for (let i = 0; i < bits; i++) {
              edges.push({ source: 'RESET', target: `CNT${i}` });
            }
            
            // Connect direction control if up-down counter
            if (upDown === 'UP_DOWN') {
              for (let i = 0; i < bits; i++) {
                edges.push({ source: 'DIR', target: `CNT${i}` });
              }
            }
            
            // Connect flip-flops for ripple counting (if not synchronous)
            if (!synchronous && bits > 1) {
              for (let i = 0; i < bits - 1; i++) {
                edges.push({ source: `CNT${i}`, target: `CNT${i + 1}` });
              }
            }
            
            // Connect outputs
            for (let i = 0; i < bits; i++) {
              edges.push({ source: `CNT${i}`, target: `Q${i}` });
            }
            
            return {
              type: 'sequential',
              name: `${bits}-bit ${upDown} ${synchronous ? 'Synchronous' : 'Ripple'} Counter`,
              description: `${bits}-bit counter with ${upDown} counting direction`,
              nodes,
              edges
            };
          }
        },
        {
          keywords: ['shift register', 'serial in serial out', 'siso', 'serial in parallel out', 'sipos'],
          complexity: 'medium',
          generate: () => {
            const bits = lowerDesc.includes('8') ? 8 : (lowerDesc.includes('2') ? 2 : 4);
            const parallelOut = lowerDesc.includes('parallel') || lowerDesc.includes('sipos');
            const nodes = [];
            const edges = [];
            
            // Clock and serial input
            nodes.push({ type: 'CLOCK', label: 'CLK', position: { x: 50, y: 100 } });
            nodes.push({ type: 'INPUT', label: 'SI', position: { x: 50, y: 200 } });
            
            // Create shift register flip-flops
            for (let i = 0; i < bits; i++) {
              nodes.push({ 
                type: 'D_FLIP_FLOP', 
                label: `SR${i}`, 
                position: { x: 200 + i * 100, y: 150 } 
              });
            }
            
            // Create outputs
            nodes.push({ type: 'OUTPUT', label: 'SO', position: { x: 200 + bits * 100, y: 150 } });
            
            if (parallelOut) {
              for (let i = 0; i < bits; i++) {
                nodes.push({ type: 'OUTPUT', label: `PO${i}`, position: { x: 200 + i * 100, y: 250 } });
              }
            }
            
            // Connect clock to all flip-flops
            for (let i = 0; i < bits; i++) {
              edges.push({ source: 'CLK', target: `SR${i}` });
            }
            
            // Connect serial input to first flip-flop
            edges.push({ source: 'SI', target: 'SR0' });
            
            // Connect flip-flops in series
            for (let i = 0; i < bits - 1; i++) {
              edges.push({ source: `SR${i}`, target: `SR${i + 1}` });
            }
            
            // Connect serial output
            edges.push({ source: `SR${bits - 1}`, target: 'SO' });
            
            // Connect parallel outputs if specified
            if (parallelOut) {
              for (let i = 0; i < bits; i++) {
                edges.push({ source: `SR${i}`, target: `PO${i}` });
              }
            }
            
            return {
              type: 'sequential',
              name: `${bits}-bit Shift Register (${parallelOut ? 'SIPO' : 'SISO'})`,
              description: `${bits}-bit shift register with ${parallelOut ? 'parallel' : 'serial'} output`,
              nodes,
              edges
            };
          }
        },
        
        // SEQUENTIAL CIRCUITS
        {
          keywords: ['state machine', 'finite state machine', 'fsm', 'controller'],
          complexity: 'complex',
          generate: () => ({
            type: 'sequential',
            name: 'Finite State Machine Controller',
            description: 'Generic finite state machine with state register and next state logic',
            nodes: [
              // Inputs
              { type: 'INPUT', label: 'CLK', position: { x: 50, y: 100 } },
              { type: 'INPUT', label: 'RESET', position: { x: 50, y: 150 } },
              { type: 'INPUT', label: 'IN0', position: { x: 50, y: 250 } },
              { type: 'INPUT', label: 'IN1', position: { x: 50, y: 300 } },
              
              // State register
              { type: 'STATE_REGISTER', label: 'STATE_REG', position: { x: 200, y: 150 } },
              
              // Next state logic
              { type: 'NEXT_STATE_LOGIC', label: 'NS_LOGIC', position: { x: 350, y: 200 } },
              
              // Output logic
              { type: 'OUTPUT_LOGIC', label: 'OUT_LOGIC', position: { x: 500, y: 200 } },
              
              // Outputs
              { type: 'OUTPUT', label: 'OUT0', position: { x: 650, y: 150 } },
              { type: 'OUTPUT', label: 'OUT1', position: { x: 650, y: 200 } },
              { type: 'OUTPUT', label: 'OUT2', position: { x: 650, y: 250 } }
            ],
            edges: [
              // Clock and reset to state register
              { source: 'CLK', target: 'STATE_REG' },
              { source: 'RESET', target: 'STATE_REG' },
              
              // Inputs to next state logic
              { source: 'IN0', target: 'NS_LOGIC' },
              { source: 'IN1', target: 'NS_LOGIC' },
              
              // State register to next state logic
              { source: 'STATE_REG', target: 'NS_LOGIC' },
              
              // Next state logic back to state register
              { source: 'NS_LOGIC', target: 'STATE_REG' },
              
              // State register to output logic
              { source: 'STATE_REG', target: 'OUT_LOGIC' },
              { source: 'IN0', target: 'OUT_LOGIC' },
              { source: 'IN1', target: 'OUT_LOGIC' },
              
              // Output logic to outputs
              { source: 'OUT_LOGIC', target: 'OUT0' },
              { source: 'OUT_LOGIC', target: 'OUT1' },
              { source: 'OUT_LOGIC', target: 'OUT2' }
            ]
          })
        }
      ];

      // Enhanced pattern matching with hierarchical recognition
      const bestMatch = AICircuitPlugin.simulationEngine.findBestPatternMatch(lowerDesc, patterns);
      
      if (bestMatch) {
        return bestMatch.generate();
      }

      // Fallback to basic gate generation
      return AICircuitPlugin.simulationEngine.generateBasicGate(lowerDesc);
    },

    // Find best pattern match using hierarchical recognition
    findBestPatternMatch: (description, patterns) => {
      let bestMatch = null;
      let bestScore = 0;
      
      // Calculate match score for each pattern
      for (const pattern of patterns) {
        const score = AICircuitPlugin.simulationEngine.calculatePatternScore(description, pattern);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = pattern;
        }
      }
      
      // Return best match if score is above threshold
      return bestScore > 0.3 ? bestMatch : null;
    },

    // Calculate pattern matching score
    calculatePatternScore: (description, pattern) => {
      let score = 0;
      const words = description.split(/\s+/);
      
      // Exact keyword matches
      const exactMatches = pattern.keywords.filter(keyword => 
        description.includes(keyword)
      ).length;
      score += exactMatches * 0.4;
      
      // Partial word matches
      const partialMatches = pattern.keywords.filter(keyword => {
        const keywordWords = keyword.split(/\s+/);
        return keywordWords.some(word => words.includes(word));
      }).length;
      score += partialMatches * 0.2;
      
      // Complexity bonus
      if (pattern.complexity === 'complex' && description.length > 30) {
        score += 0.2;
      } else if (pattern.complexity === 'medium' && description.length > 20) {
        score += 0.1;
      }
      
      // Technical term density
      const technicalTerms = ['bit', 'input', 'output', 'clock', 'reset', 'data', 'control', 'logic', 'gate'];
      const termCount = technicalTerms.filter(term => description.includes(term)).length;
      score += Math.min(termCount * 0.05, 0.3);
      
      return Math.min(score, 1.0);
    },

    // Generate basic gate based on description
    generateBasicGate: (description) => {
      const gateTypes = {
        'and': { type: 'AND', inputs: 2 },
        'or': { type: 'OR', inputs: 2 },
        'not': { type: 'NOT', inputs: 1 },
        'nand': { type: 'NAND', inputs: 2 },
        'nor': { type: 'NOR', inputs: 2 },
        'xor': { type: 'XOR', inputs: 2 },
        'xnor': { type: 'XNOR', inputs: 2 }
      };
      
      let gateType = 'AND';
      let inputCount = 2;
      
      // Detect gate type
      for (const [key, config] of Object.entries(gateTypes)) {
        if (description.includes(key)) {
          gateType = config.type;
          inputCount = config.inputs;
          break;
        }
      }
      
      // Detect input count
      const inputMatch = description.match(/(\d+)\s*(?:input|bit)/i);
      if (inputMatch) {
        inputCount = Math.min(parseInt(inputMatch[1]), 8);
      }
      
      // Generate nodes
      const nodes = [];
      const edges = [];
      
      // Create inputs
      for (let i = 0; i < inputCount; i++) {
        nodes.push({
          type: 'INPUT',
          label: String.fromCharCode(65 + i), // A, B, C, ...
          position: { x: 100, y: 100 + i * 80 }
        });
      }
      
      // Create gate
      nodes.push({
        type: gateType,
        label: gateType,
        position: { x: 300, y: 100 + (inputCount - 1) * 40 }
      });
      
      // Create output
      nodes.push({
        type: 'OUTPUT',
        label: 'Y',
        position: { x: 500, y: 100 + (inputCount - 1) * 40 }
      });
      
      // Connect inputs to gate
      for (let i = 0; i < inputCount; i++) {
        edges.push({
          source: String.fromCharCode(65 + i),
          target: gateType
        });
      }
      
      // Connect gate to output
      edges.push({
        source: gateType,
        target: 'Y'
      });
      
      return {
        type: 'combinational',
        name: `${inputCount}-input ${gateType} Gate`,
        description: `Basic ${gateType} gate with ${inputCount} inputs`,
        nodes,
        edges
      };
    },

    // Generate circuit from parsed description
    generateCircuit: (description) => {
      try {
        console.log('AI generating circuit for:', description);
        
        if (!description || typeof description !== 'string') {
          throw new Error('Invalid description provided');
        }
        
        const parsed = AICircuitPlugin.simulationEngine.parseDescription(description);
        console.log('Parsed circuit:', parsed);
        
        if (!parsed || !parsed.nodes || !parsed.edges) {
          throw new Error('Failed to parse circuit description');
        }
        
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

        const edges = parsed.edges.map((edge, index) => {
          const sourceId = nodeMap[edge.source] || edge.source;
          const targetId = nodeMap[edge.target] || edge.target;
          
          if (!sourceId || !targetId) {
            console.warn('Invalid edge connection:', edge);
            return null;
          }
          
          return {
            id: `edge_${Date.now()}_${index}`,
            source: sourceId,
            target: targetId,
            type: 'animated'
          };
        }).filter(edge => edge !== null); // Remove invalid edges
        
        console.log('Generated nodes:', nodes);
        console.log('Generated edges:', edges);

        const result = {
          name: parsed.name || 'Generated Circuit',
          description: parsed.description || 'AI generated circuit',
          type: parsed.type || 'combinational',
          nodes,
          edges,
          confidence: AICircuitPlugin.simulationEngine.calculateConfidence(description, parsed),
          suggestions: AICircuitPlugin.simulationEngine.generateSuggestions(description, parsed)
        };
        
        console.log('Final result:', result);
        return result;
        
      } catch (error) {
        console.error('Error generating circuit:', error);
        
        // Return a simple AND gate as fallback
        return {
          name: 'Basic AND Gate',
          description: 'Fallback circuit due to generation error',
          type: 'combinational',
          nodes: [
            {
              id: 'node_input_a',
              type: 'gate',
              position: { x: 100, y: 150 },
              data: { label: 'INPUT', value: false }
            },
            {
              id: 'node_input_b', 
              type: 'gate',
              position: { x: 100, y: 250 },
              data: { label: 'INPUT', value: false }
            },
            {
              id: 'node_and',
              type: 'gate',
              position: { x: 300, y: 200 },
              data: { label: 'AND', value: false }
            },
            {
              id: 'node_output',
              type: 'gate',
              position: { x: 500, y: 200 },
              data: { label: 'OUTPUT', value: false }
            }
          ],
          edges: [
            { id: 'edge_a_and', source: 'node_input_a', target: 'node_and', type: 'animated' },
            { id: 'edge_b_and', source: 'node_input_b', target: 'node_and', type: 'animated' },
            { id: 'edge_and_out', source: 'node_and', target: 'node_output', type: 'animated' }
          ],
          confidence: 0.1,
          suggestions: ['Try a more specific circuit description', 'Include bit widths (e.g., "4-bit")', 'Specify circuit type (e.g., "adder", "counter")']
        };
      }
    },

    // Calculate confidence score for AI generation
    calculateConfidence: (description, parsed) => {
      let confidence = 0.3; // Lower base confidence for more accuracy
      
      // Boost confidence for specific circuit types
      const circuitTypes = [
        'half adder', 'full adder', 'ripple carry adder', 'multi-bit adder',
        'multiplexer', 'mux', 'decoder', 'counter', 'register', 'flip flop',
        'alu', 'arithmetic logic unit', 'state machine', 'fsm',
        'shift register', 'synchronous counter', 'up counter', 'down counter'
      ];
      
      const exactMatches = circuitTypes.filter(type => 
        description.toLowerCase().includes(type)
      ).length;
      
      if (exactMatches > 0) {
        confidence += exactMatches * 0.25;
      }

      // Boost confidence for technical specificity
      const technicalIndicators = [
        'bit', 'input', 'output', 'clock', 'reset', 'data', 'control',
        'serial', 'parallel', 'synchronous', 'asynchronous', 'ripple'
      ];
      
      const techCount = technicalIndicators.filter(indicator => 
        description.toLowerCase().includes(indicator)
      ).length;
      
      confidence += Math.min(techCount * 0.08, 0.3);

      // Boost confidence for complexity indicators
      if (description.length > 40) {
        confidence += 0.15; // Detailed descriptions
      } else if (description.length > 25) {
        confidence += 0.1; // Medium descriptions
      }

      // Boost for specific numbers (bit widths, etc.)
      const hasNumbers = /\d+/.test(description);
      if (hasNumbers) {
        confidence += 0.1;
      }

      return Math.min(confidence, 0.95); // Cap at 95% for honesty
    },

    // Generate alternative suggestions
    generateSuggestions: (description, parsed) => {
      const suggestions = [];
      const lowerDesc = description.toLowerCase();
      
      // Adder-related suggestions
      if (parsed.name.includes('Adder')) {
        suggestions.push('Try "subtractor" for subtraction operations');
        suggestions.push('Consider "carry look-ahead adder" for faster performance');
        suggestions.push('Try "8-bit adder" for larger number addition');
        if (!lowerDesc.includes('ripple')) {
          suggestions.push('Consider "ripple carry adder" for multi-bit addition');
        }
      }
      
      // Multiplexer-related suggestions
      if (parsed.name.includes('Multiplexer') || parsed.name.includes('MUX')) {
        suggestions.push('Try "demultiplexer" for signal distribution');
        if (!lowerDesc.includes('8')) {
          suggestions.push('Consider "8-to-1 mux" for more inputs');
        }
        suggestions.push('Try "tree multiplexer" for large-scale selection');
      }
      
      // Counter-related suggestions
      if (parsed.name.includes('Counter')) {
        if (!lowerDesc.includes('down')) {
          suggestions.push('Try "down counter" for counting backwards');
        }
        if (!lowerDesc.includes('up-down')) {
          suggestions.push('Consider "up-down counter" for bidirectional counting');
        }
        if (!lowerDesc.includes('synchronous')) {
          suggestions.push('Try "synchronous counter" for better timing');
        }
      }
      
      // Register-related suggestions
      if (parsed.name.includes('Register')) {
        suggestions.push('Try "parallel in serial out" register for different data flow');
        suggestions.push('Consider "universal shift register" for multiple modes');
        if (!lowerDesc.includes('jk')) {
          suggestions.push('Try "JK register" for toggle functionality');
        }
      }
      
      // ALU-related suggestions
      if (parsed.name.includes('ALU')) {
        suggestions.push('Consider adding "status flags" for condition codes');
        suggestions.push('Try "8-bit ALU" for larger data processing');
        suggestions.push('Add "barrel shifter" for rotation operations');
      }
      
      // General complexity suggestions
      if (parsed.type === 'combinational') {
        suggestions.push('Consider adding "pipelining" for faster processing');
        suggestions.push('Try "circuit optimization" to reduce gate count');
      }
      
      if (parsed.type === 'sequential') {
        suggestions.push('Consider "state machine design" for control logic');
        suggestions.push('Try "clock gating" for power optimization');
      }
      
      // Add fallback suggestions if no specific ones
      if (suggestions.length === 0) {
        suggestions.push('Try being more specific about bit widths (e.g., "4-bit", "8-bit")');
        suggestions.push('Include timing requirements (e.g., "synchronous", "clocked")');
        suggestions.push('Specify input/output types (e.g., "serial", "parallel")');
      }

      return suggestions.slice(0, 4); // Limit to 4 suggestions
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
