import React, { useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const StandardCellLibrary_v2 = () => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode, addEdge, clearCircuit } = useCircuitStore();

  // Comprehensive standard cell library with timing and power characteristics
  const standardCells = {
    basic: [
      {
        id: 'and2',
        name: '2-Input AND',
        description: '2-input AND gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 0.8, // ns
        power: 0.12, // mW
        area: 4, // um²
        function: (a, b) => a && b,
        icon: '&'
      },
      {
        id: 'or2',
        name: '2-Input OR',
        description: '2-input OR gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 0.9,
        power: 0.15,
        area: 4,
        function: (a, b) => a || b,
        icon: '|'
      },
      {
        id: 'nand2',
        name: '2-Input NAND',
        description: '2-input NAND gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 0.7,
        power: 0.10,
        area: 3.5,
        function: (a, b) => !(a && b),
        icon: '!'
      },
      {
        id: 'nor2',
        name: '2-Input NOR',
        description: '2-input NOR gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 0.8,
        power: 0.11,
        area: 3.5,
        function: (a, b) => !(a || b),
        icon: '!'
      },
      {
        id: 'xor2',
        name: '2-Input XOR',
        description: '2-input XOR gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 1.2,
        power: 0.18,
        area: 6,
        function: (a, b) => a !== b,
        icon: 'X'
      },
      {
        id: 'xnor2',
        name: '2-Input XNOR',
        description: '2-input XNOR gate',
        inputs: ['A', 'B'],
        outputs: ['Y'],
        delay: 1.3,
        power: 0.20,
        area: 6.5,
        function: (a, b) => a === b,
        icon: 'X'
      },
      {
        id: 'inv',
        name: 'Inverter',
        description: 'NOT gate',
        inputs: ['A'],
        outputs: ['Y'],
        delay: 0.4,
        power: 0.06,
        area: 2,
        function: (a) => !a,
        icon: '!'
      },
      {
        id: 'buf',
        name: 'Buffer',
        description: 'Signal buffer',
        inputs: ['A'],
        outputs: ['Y'],
        delay: 0.3,
        power: 0.08,
        area: 2.5,
        function: (a) => a,
        icon: 'B'
      }
    ],
    sequential: [
      {
        id: 'dff',
        name: 'D Flip-Flop',
        description: 'D-type flip-flop with reset',
        inputs: ['D', 'CLK', 'RST'],
        outputs: ['Q', 'Q_bar'],
        delay: 1.5,
        power: 0.25,
        area: 12,
        setupTime: 0.3,
        holdTime: 0.1,
        icon: 'DFF'
      },
      {
        id: 'jkff',
        name: 'JK Flip-Flop',
        description: 'JK-type flip-flop with reset',
        inputs: ['J', 'K', 'CLK', 'RST'],
        outputs: ['Q', 'Q_bar'],
        delay: 1.8,
        power: 0.30,
        area: 14,
        setupTime: 0.4,
        holdTime: 0.1,
        icon: 'JKFF'
      },
      {
        id: 'tff',
        name: 'T Flip-Flop',
        description: 'T-type flip-flop with reset',
        inputs: ['T', 'CLK', 'RST'],
        outputs: ['Q', 'Q_bar'],
        delay: 1.6,
        power: 0.28,
        area: 13,
        setupTime: 0.3,
        holdTime: 0.1,
        icon: 'TFF'
      },
      {
        id: 'srff',
        name: 'SR Latch',
        description: 'SR-type latch',
        inputs: ['S', 'R'],
        outputs: ['Q', 'Q_bar'],
        delay: 0.8,
        power: 0.20,
        area: 10,
        icon: 'SRL'
      }
    ],
    arithmetic: [
      {
        id: 'half_adder',
        name: 'Half Adder',
        description: '1-bit adder with carry',
        inputs: ['A', 'B'],
        outputs: ['SUM', 'CARRY'],
        delay: 1.8,
        power: 0.35,
        area: 20,
        function: (a, b) => ({
          sum: a ^ b,
          carry: a && b
        }),
        icon: 'HA'
      },
      {
        id: 'full_adder',
        name: 'Full Adder',
        description: '1-bit adder with carry in/out',
        inputs: ['A', 'B', 'CIN'],
        outputs: ['SUM', 'COUT'],
        delay: 2.2,
        power: 0.45,
        area: 28,
        function: (a, b, cin) => ({
          sum: a ^ b ^ cin,
          cout: (a && b) || (b && cin) || (a && cin)
        }),
        icon: 'FA'
      },
      {
        id: 'ripple_carry_adder',
        name: '4-bit Ripple Carry Adder',
        description: '4-bit adder with ripple carry',
        inputs: ['A[3:0]', 'B[3:0]', 'CIN'],
        outputs: ['SUM[3:0]', 'COUT'],
        delay: 8.8,
        power: 1.8,
        area: 112,
        icon: 'RCA4'
      },
      {
        id: 'carry_lookahead_adder',
        name: '4-bit Carry Lookahead Adder',
        description: '4-bit adder with carry lookahead',
        inputs: ['A[3:0]', 'B[3:0]', 'CIN'],
        outputs: ['SUM[3:0]', 'COUT'],
        delay: 4.5,
        power: 2.2,
        area: 140,
        icon: 'CLA4'
      },
      {
        id: 'multiplier_2x2',
        name: '2x2 Multiplier',
        description: '2-bit by 2-bit multiplier',
        inputs: ['A[1:0]', 'B[1:0]'],
        outputs: ['P[3:0]'],
        delay: 6.5,
        power: 1.2,
        area: 80,
        icon: 'MUL2'
      },
      {
        id: 'comparator',
        name: '4-bit Comparator',
        description: '4-bit magnitude comparator',
        inputs: ['A[3:0]', 'B[3:0]'],
        outputs: ['GT', 'EQ', 'LT'],
        delay: 3.2,
        power: 0.8,
        area: 45,
        icon: 'CMP4'
      }
    ],
    multiplexers: [
      {
        id: 'mux2_1',
        name: '2:1 Mux',
        description: '2-to-1 multiplexer',
        inputs: ['D0', 'D1', 'SEL'],
        outputs: ['Y'],
        delay: 1.0,
        power: 0.15,
        area: 8,
        function: (d0, d1, sel) => sel ? d1 : d0,
        icon: 'MUX2'
      },
      {
        id: 'mux4_1',
        name: '4:1 Mux',
        description: '4-to-1 multiplexer',
        inputs: ['D0', 'D1', 'D2', 'D3', 'SEL[1:0]'],
        outputs: ['Y'],
        delay: 1.8,
        power: 0.25,
        area: 16,
        icon: 'MUX4'
      },
      {
        id: 'mux8_1',
        name: '8:1 Mux',
        description: '8-to-1 multiplexer',
        inputs: ['D0-D7', 'SEL[2:0]'],
        outputs: ['Y'],
        delay: 2.8,
        power: 0.40,
        area: 32,
        icon: 'MUX8'
      },
      {
        id: 'demux2_1',
        name: '1:2 Demux',
        description: '1-to-2 demultiplexer',
        inputs: ['D', 'SEL'],
        outputs: ['Y0', 'Y1'],
        delay: 1.1,
        power: 0.18,
        area: 10,
        icon: 'DMUX2'
      },
      {
        id: 'demux4_1',
        name: '1:4 Demux',
        description: '1-to-4 demultiplexer',
        inputs: ['D', 'SEL[1:0]'],
        outputs: ['Y0', 'Y1', 'Y2', 'Y3'],
        delay: 1.9,
        power: 0.30,
        area: 20,
        icon: 'DMUX4'
      }
    ],
    memory: [
      {
        id: 'register_8bit',
        name: '8-bit Register',
        description: '8-bit parallel load register',
        inputs: ['D[7:0]', 'CLK', 'EN', 'RST'],
        outputs: ['Q[7:0]'],
        delay: 2.5,
        power: 0.8,
        area: 96,
        icon: 'REG8'
      },
      {
        id: 'shift_right',
        name: '8-bit Shift Right',
        description: '8-bit right shift register',
        inputs: ['D[7:0]', 'CLK', 'EN', 'RST'],
        outputs: ['Q[7:0]'],
        delay: 2.8,
        power: 0.9,
        area: 104,
        icon: 'SRR8'
      },
      {
        id: 'shift_left',
        name: '8-bit Shift Left',
        description: '8-bit left shift register',
        inputs: ['D[7:0]', 'CLK', 'EN', 'RST'],
        outputs: ['Q[7:0]'],
        delay: 2.8,
        power: 0.9,
        area: 104,
        icon: 'SRL8'
      },
      {
        id: 'counter_4bit',
        name: '4-bit Counter',
        description: '4-bit up counter with load',
        inputs: ['CLK', 'EN', 'RST', 'LOAD', 'D[3:0]'],
        outputs: ['Q[3:0]', 'COUT'],
        delay: 3.5,
        power: 1.2,
        area: 120,
        icon: 'CNT4'
      },
      {
        id: 'ram_16x8',
        name: '16x8 RAM',
        description: '16 words x 8 bits RAM',
        inputs: ['ADDR[3:0]', 'D[7:0]', 'WE', 'CLK', 'CS'],
        outputs: ['Q[7:0]'],
        delay: 4.2,
        power: 2.5,
        area: 280,
        icon: 'RAM16'
      },
      {
        id: 'rom_32x8',
        name: '32x8 ROM',
        description: '32 words x 8 bits ROM',
        inputs: ['ADDR[4:0]', 'CS'],
        outputs: ['Q[7:0]'],
        delay: 3.8,
        power: 1.8,
        area: 320,
        icon: 'ROM32'
      }
    ],
    io: [
      {
        id: 'input_buffer',
        name: 'Input Buffer',
        description: 'Pad input buffer with protection',
        inputs: ['PAD'],
        outputs: ['Y'],
        delay: 2.1,
        power: 0.12,
        area: 15,
        icon: 'INB'
      },
      {
        id: 'output_buffer',
        name: 'Output Buffer',
        description: 'Pad output buffer with drive strength',
        inputs: ['A', 'EN'],
        outputs: ['PAD'],
        delay: 2.8,
        power: 0.35,
        area: 25,
        icon: 'OUTB'
      },
      {
        id: 'tri_state_buffer',
        name: 'Tri-state Buffer',
        description: '3-state output buffer',
        inputs: ['A', 'EN'],
        outputs: ['Y'],
        delay: 1.5,
        power: 0.20,
        area: 12,
        icon: 'TSB'
      },
      {
        id: 'level_shifter',
        name: 'Level Shifter',
        description: 'Voltage level translator',
        inputs: ['IN'],
        outputs: ['OUT'],
        delay: 1.8,
        power: 0.08,
        area: 8,
        icon: 'LS'
      }
    ]
  };

  // Filter cells based on search term
  const filteredCells = Object.entries(standardCells).flatMap(([category, cells]) =>
    cells.filter(cell =>
      cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(cell => ({ ...cell, category }))
  );

  // Add cell to circuit
  const addCellToCircuit = (cell) => {
    const timestamp = Date.now();
    const nodeId = `${cell.id}_${timestamp}`;
    
    // Calculate position based on category
    const categoryPositions = {
      basic: { x: 100, y: 100 },
      sequential: { x: 200, y: 100 },
      arithmetic: { x: 300, y: 100 },
      multiplexers: { x: 400, y: 100 },
      memory: { x: 100, y: 200 },
      io: { x: 200, y: 200 }
    };
    
    const position = categoryPositions[cell.category] || { x: 150, y: 150 };
    
    addNode({
      id: nodeId,
      type: 'gate',
      position: { 
        x: position.x + Math.random() * 50, 
        y: position.y + Math.random() * 50 
      },
      data: { 
        label: cell.name,
        cellType: cell.id,
        delay: cell.delay,
        power: cell.power,
        area: cell.area,
        value: false
      }
    });
  };

  // Create circuit from cell template
  const createCircuitFromTemplate = (cell) => {
    clearCircuit();
    const timestamp = Date.now();
    
    // Create main cell node
    const mainNodeId = `${cell.id}_${timestamp}`;
    addNode({
      id: mainNodeId,
      type: 'gate',
      position: { x: 300, y: 200 },
      data: { 
        label: cell.name,
        cellType: cell.id,
        delay: cell.delay,
        power: cell.power,
        area: cell.area,
        value: false
      }
    });
    
    // Create input nodes
    cell.inputs.forEach((input, index) => {
      const inputNodeId = `input_${input}_${timestamp}`;
      addNode({
        id: inputNodeId,
        type: 'gate',
        position: { x: 100, y: 100 + index * 60 },
        data: { label: 'INPUT', value: false }
      });
      
      // Connect input to main cell
      setTimeout(() => {
        addEdge({
          id: `edge_${input}_${timestamp}`,
          source: inputNodeId,
          target: mainNodeId
        });
      }, 100);
    });
    
    // Create output nodes
    cell.outputs.forEach((output, index) => {
      const outputNodeId = `output_${output}_${timestamp}`;
      addNode({
        id: outputNodeId,
        type: 'gate',
        position: { x: 500, y: 100 + index * 60 },
        data: { label: 'OUTPUT', value: false }
      });
      
      // Connect main cell to output
      setTimeout(() => {
        addEdge({
          id: `edge_${output}_${timestamp}`,
          source: mainNodeId,
          target: outputNodeId
        });
      }, 200);
    });
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'transparent',
      padding: '0px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: '700', 
        color: '#f8fafc',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Standard Cell Library
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="Search cells..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '4px',
            color: '#f8fafc',
            fontSize: '9px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Categories:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {Object.keys(standardCells).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '4px 6px',
                backgroundColor: selectedCategory === category ? '#3b82f6' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: '3px',
                color: 'white',
                fontSize: '7px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cell List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Cells:
        </div>
        <div style={{ 
          maxHeight: '300px', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {standardCells[selectedCategory]
            .filter(cell =>
              cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cell.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(cell => (
            <div
              key={cell.id}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#334155';
                e.target.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1e293b';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: '700', 
                    color: '#f8fafc',
                    marginBottom: '2px'
                  }}>
                    {cell.icon} {cell.name}
                  </div>
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    {cell.description}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '7px', color: '#cbd5e1' }}>
                    <span>Delay: {cell.delay}ns</span>
                    <span>Power: {cell.power}mW</span>
                    <span>Area: {cell.area}um²</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', fontSize: '7px', color: '#94a3b8' }}>
                    <span>I/O: {cell.inputs.length}in/{cell.outputs.length}out</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                <button
                  onClick={() => addCellToCircuit(cell)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    fontSize: '7px',
                    cursor: 'pointer'
                  }}
                >
                  Add Cell
                </button>
                <button
                  onClick={() => createCircuitFromTemplate(cell)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    backgroundColor: '#8b5cf6',
                    border: 'none',
                    borderRadius: '3px',
                    color: 'white',
                    fontSize: '7px',
                    cursor: 'pointer'
                  }}
                >
                  Create Circuit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Library Statistics */}
      <div style={{ 
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '6px'
      }}>
        <div style={{ 
          fontSize: '9px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Library Statistics:
        </div>
        <div style={{ fontSize: '7px', color: '#94a3b8', lineHeight: '1.3' }}>
          <div>Total Cells: {Object.values(standardCells).flat().length}</div>
          <div>Categories: {Object.keys(standardCells).length}</div>
          <div>Avg Delay: {(Object.values(standardCells).flat().reduce((sum, cell) => sum + cell.delay, 0) / Object.values(standardCells).flat().length).toFixed(2)}ns</div>
          <div>Total Area: {Object.values(standardCells).flat().reduce((sum, cell) => sum + cell.area, 0)}um²</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '7px', 
        color: '#64748b', 
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        Professional standard cell library with
        <br />
        timing, power, and area characterization
      </div>
    </div>
  );
};

export default StandardCellLibrary_v2;
