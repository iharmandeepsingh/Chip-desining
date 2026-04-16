import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const StandardCellLibrary = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [libraryData, setLibraryData] = useState({
    cells: [],
    hierarchies: [],
    selectedCell: null,
    selectedHierarchy: null,
    searchQuery: '',
    categoryFilter: 'all'
  });

  // Standard cell definitions
  const standardCells = [
    // Basic logic gates
    {
      id: 'AND2',
      name: '2-Input AND',
      category: 'logic',
      type: 'combinational',
      width: 2,
      height: 4,
      delay: 0.1,
      power: 0.5,
      area: 8,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 2, y: 2 }, layer: 'metal1' }
      ],
      description: '2-input AND gate with standard cell interface',
      truthTable: [
        { A: 0, B: 0, Y: 0 },
        { A: 0, B: 1, Y: 0 },
        { A: 1, B: 0, Y: 0 },
        { A: 1, B: 1, Y: 1 }
      ]
    },
    {
      id: 'OR2',
      name: '2-Input OR',
      category: 'logic',
      type: 'combinational',
      width: 2,
      height: 4,
      delay: 0.12,
      power: 0.6,
      area: 8,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 2, y: 2 }, layer: 'metal1' }
      ],
      description: '2-input OR gate with standard cell interface',
      truthTable: [
        { A: 0, B: 0, Y: 0 },
        { A: 0, B: 1, Y: 1 },
        { A: 1, B: 0, Y: 1 },
        { A: 1, B: 1, Y: 1 }
      ]
    },
    {
      id: 'NOT',
      name: 'Inverter',
      category: 'logic',
      type: 'combinational',
      width: 1,
      height: 4,
      delay: 0.05,
      power: 0.3,
      area: 4,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 2 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 1, y: 2 }, layer: 'metal1' }
      ],
      description: 'Single inverter with optimal drive strength',
      truthTable: [
        { A: 0, Y: 1 },
        { A: 1, Y: 0 }
      ]
    },
    {
      id: 'XOR2',
      name: '2-Input XOR',
      category: 'logic',
      type: 'combinational',
      width: 3,
      height: 4,
      delay: 0.2,
      power: 0.8,
      area: 12,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 3, y: 2 }, layer: 'metal1' }
      ],
      description: '2-input XOR gate for arithmetic operations',
      truthTable: [
        { A: 0, B: 0, Y: 0 },
        { A: 0, B: 1, Y: 1 },
        { A: 1, B: 0, Y: 1 },
        { A: 1, B: 1, Y: 0 }
      ]
    },
    {
      id: 'NAND2',
      name: '2-Input NAND',
      category: 'logic',
      type: 'combinational',
      width: 2,
      height: 4,
      delay: 0.08,
      power: 0.4,
      area: 8,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 2, y: 2 }, layer: 'metal1' }
      ],
      description: '2-input NAND gate - universal gate',
      truthTable: [
        { A: 0, B: 0, Y: 1 },
        { A: 0, B: 1, Y: 1 },
        { A: 1, B: 0, Y: 1 },
        { A: 1, B: 1, Y: 0 }
      ]
    },
    {
      id: 'NOR2',
      name: '2-Input NOR',
      category: 'logic',
      type: 'combinational',
      width: 2,
      height: 4,
      delay: 0.09,
      power: 0.45,
      area: 8,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'Y', direction: 'output', position: { x: 2, y: 2 }, layer: 'metal1' }
      ],
      description: '2-input NOR gate - universal gate',
      truthTable: [
        { A: 0, B: 0, Y: 1 },
        { A: 0, B: 1, Y: 0 },
        { A: 1, B: 0, Y: 0 },
        { A: 1, B: 1, Y: 0 }
      ]
    },
    
    // Sequential cells
    {
      id: 'DFF',
      name: 'D Flip-Flop',
      category: 'sequential',
      type: 'sequential',
      width: 3,
      height: 6,
      delay: 0.3,
      power: 1.2,
      area: 18,
      pins: [
        { name: 'D', direction: 'input', position: { x: 0, y: 2 }, layer: 'metal1' },
        { name: 'CLK', direction: 'input', position: { x: 0, y: 4 }, layer: 'metal1' },
        { name: 'Q', direction: 'output', position: { x: 3, y: 2 }, layer: 'metal1' },
        { name: 'QN', direction: 'output', position: { x: 3, y: 4 }, layer: 'metal1' }
      ],
      description: 'Edge-triggered D flip-flop with asynchronous reset',
      timing: {
        setup: 0.05,
        hold: 0.02,
        clk_to_q: 0.15
      }
    },
    {
      id: 'JKFF',
      name: 'JK Flip-Flop',
      category: 'sequential',
      type: 'sequential',
      width: 4,
      height: 6,
      delay: 0.35,
      power: 1.5,
      area: 24,
      pins: [
        { name: 'J', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'K', direction: 'input', position: { x: 0, y: 2 }, layer: 'metal1' },
        { name: 'CLK', direction: 'input', position: { x: 0, y: 4 }, layer: 'metal1' },
        { name: 'Q', direction: 'output', position: { x: 4, y: 2 }, layer: 'metal1' },
        { name: 'QN', direction: 'output', position: { x: 4, y: 4 }, layer: 'metal1' }
      ],
      description: 'JK flip-flop with toggle capability',
      timing: {
        setup: 0.06,
        hold: 0.03,
        clk_to_q: 0.18
      }
    },
    
    // Arithmetic cells
    {
      id: 'FA',
      name: 'Full Adder',
      category: 'arithmetic',
      type: 'combinational',
      width: 4,
      height: 4,
      delay: 0.25,
      power: 1.0,
      area: 16,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 2 }, layer: 'metal1' },
        { name: 'CIN', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'SUM', direction: 'output', position: { x: 4, y: 1 }, layer: 'metal1' },
        { name: 'COUT', direction: 'output', position: { x: 4, y: 3 }, layer: 'metal1' }
      ],
      description: '1-bit full adder for arithmetic operations'
    },
    {
      id: 'HA',
      name: 'Half Adder',
      category: 'arithmetic',
      type: 'combinational',
      width: 3,
      height: 4,
      delay: 0.18,
      power: 0.7,
      area: 12,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 1 }, layer: 'metal1' },
        { name: 'B', direction: 'input', position: { x: 0, y: 3 }, layer: 'metal1' },
        { name: 'SUM', direction: 'output', position: { x: 3, y: 1 }, layer: 'metal1' },
        { name: 'CARRY', direction: 'output', position: { x: 3, y: 3 }, layer: 'metal1' }
      ],
      description: '1-bit half adder for LSB addition'
    },
    
    // Memory cells
    {
      id: 'SRAM',
      name: 'SRAM Cell',
      category: 'memory',
      type: 'memory',
      width: 6,
      height: 8,
      delay: 0.4,
      power: 2.0,
      area: 48,
      pins: [
        { name: 'WL', direction: 'input', position: { x: 0, y: 2 }, layer: 'metal1' },
        { name: 'BL', direction: 'inout', position: { x: 6, y: 3 }, layer: 'metal1' },
        { name: 'BLB', direction: 'inout', position: { x: 6, y: 5 }, layer: 'metal1' }
      ],
      description: '6T SRAM cell for memory arrays'
    },
    
    // I/O cells
    {
      id: 'PAD_IN',
      name: 'Input Pad',
      category: 'io',
      type: 'io',
      width: 8,
      height: 10,
      delay: 0.5,
      power: 3.0,
      area: 80,
      pins: [
        { name: 'PAD', direction: 'inout', position: { x: 0, y: 5 }, layer: 'metal2' },
        { name: 'Y', direction: 'output', position: { x: 8, y: 5 }, layer: 'metal1' }
      ],
      description: 'Input buffer with ESD protection'
    },
    {
      id: 'PAD_OUT',
      name: 'Output Pad',
      category: 'io',
      type: 'io',
      width: 8,
      height: 10,
      delay: 0.6,
      power: 4.0,
      area: 80,
      pins: [
        { name: 'A', direction: 'input', position: { x: 0, y: 5 }, layer: 'metal1' },
        { name: 'PAD', direction: 'inout', position: { x: 8, y: 5 }, layer: 'metal2' }
      ],
      description: 'Output buffer with drive strength control'
    }
  ];

  // Hierarchical design templates
  const hierarchicalDesigns = [
    {
      id: 'adder_4bit',
      name: '4-bit Adder',
      category: 'arithmetic',
      description: '4-bit ripple carry adder using full adders',
      cells: ['FA', 'FA', 'FA', 'FA'],
      width: 20,
      height: 8,
      interfaces: [
        { name: 'A[3:0]', direction: 'input', pins: ['A3', 'A2', 'A1', 'A0'] },
        { name: 'B[3:0]', direction: 'input', pins: ['B3', 'B2', 'B1', 'B0'] },
        { name: 'CIN', direction: 'input', pins: ['CIN'] },
        { name: 'SUM[3:0]', direction: 'output', pins: ['SUM3', 'SUM2', 'SUM1', 'SUM0'] },
        { name: 'COUT', direction: 'output', pins: ['COUT'] }
      ]
    },
    {
      id: 'mux_4to1',
      name: '4-to-1 Mux',
      category: 'logic',
      description: '4-to-1 multiplexer using 2-to-1 muxes',
      cells: ['MUX2', 'MUX2', 'MUX2'],
      width: 12,
      height: 6,
      interfaces: [
        { name: 'D[3:0]', direction: 'input', pins: ['D3', 'D2', 'D1', 'D0'] },
        { name: 'SEL[1:0]', direction: 'input', pins: ['SEL1', 'SEL0'] },
        { name: 'Y', direction: 'output', pins: ['Y'] }
      ]
    },
    {
      id: 'counter_4bit',
      name: '4-bit Counter',
      category: 'sequential',
      description: '4-bit synchronous counter with enable',
      cells: ['DFF', 'DFF', 'DFF', 'DFF'],
      width: 16,
      height: 10,
      interfaces: [
        { name: 'CLK', direction: 'input', pins: ['CLK'] },
        { name: 'RESET', direction: 'input', pins: ['RESET'] },
        { name: 'ENABLE', direction: 'input', pins: ['ENABLE'] },
        { name: 'Q[3:0]', direction: 'output', pins: ['Q3', 'Q2', 'Q1', 'Q0'] }
      ]
    },
    {
      id: 'alu_8bit',
      name: '8-bit ALU',
      category: 'arithmetic',
      description: '8-bit arithmetic logic unit',
      cells: ['FA', 'FA', 'FA', 'FA', 'FA', 'FA', 'FA', 'FA'],
      width: 40,
      height: 12,
      interfaces: [
        { name: 'A[7:0]', direction: 'input', pins: ['A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1', 'A0'] },
        { name: 'B[7:0]', direction: 'input', pins: ['B7', 'B6', 'B5', 'B4', 'B3', 'B2', 'B1', 'B0'] },
        { name: 'OP[2:0]', direction: 'input', pins: ['OP2', 'OP1', 'OP0'] },
        { name: 'Y[7:0]', direction: 'output', pins: ['Y7', 'Y6', 'Y5', 'Y4', 'Y3', 'Y2', 'Y1', 'Y0'] }
      ]
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Cells', count: standardCells.length },
    { id: 'logic', name: 'Logic Gates', count: standardCells.filter(c => c.category === 'logic').length },
    { id: 'sequential', name: 'Sequential', count: standardCells.filter(c => c.category === 'sequential').length },
    { id: 'arithmetic', name: 'Arithmetic', count: standardCells.filter(c => c.category === 'arithmetic').length },
    { id: 'memory', name: 'Memory', count: standardCells.filter(c => c.category === 'memory').length },
    { id: 'io', name: 'I/O', count: standardCells.filter(c => c.category === 'io').length }
  ];

  // Initialize library
  useEffect(() => {
    setLibraryData(prev => ({
      ...prev,
      cells: standardCells,
      hierarchies: hierarchicalDesigns
    }));
  }, []);

  // Filter cells
  const getFilteredCells = () => {
    let filtered = libraryData.cells;
    
    if (libraryData.categoryFilter !== 'all') {
      filtered = filtered.filter(cell => cell.category === libraryData.categoryFilter);
    }
    
    if (libraryData.searchQuery) {
      const query = libraryData.searchQuery.toLowerCase();
      filtered = filtered.filter(cell => 
        cell.name.toLowerCase().includes(query) ||
        cell.description.toLowerCase().includes(query) ||
        cell.id.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Add cell to circuit
  const addCellToCircuit = (cell) => {
    const nodeId = `cell_${cell.id}_${Date.now()}`;
    
    addNode({
      id: nodeId,
      type: 'standard_cell',
      position: { x: 400, y: 300 },
      data: {
        label: cell.name,
        cellType: cell.id,
        cellData: cell,
        value: false
      }
    });
  };

  // Add hierarchical design to circuit
  const addHierarchyToCircuit = (hierarchy) => {
    // This would expand the hierarchy into individual cells
    const nodeId = `hierarchy_${hierarchy.id}_${Date.now()}`;
    
    addNode({
      id: nodeId,
      type: 'hierarchical_cell',
      position: { x: 400, y: 300 },
      data: {
        label: hierarchy.name,
        hierarchyType: hierarchy.id,
        hierarchyData: hierarchy,
        value: false
      }
    });
  };

  // Render cell details
  const renderCellDetails = (cell) => {
    return (
      <div
        style={{
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
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
          Cell Details
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Type</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.type}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Width</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.width} units</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Height</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.height} units</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Area</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.area} units²</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Delay</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.delay} ns</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Power</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.power} mW</div>
          </div>
        </div>

        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Description</div>
          <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{cell.description}</div>
        </div>

        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Pins</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cell.pins.map((pin, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  backgroundColor: pin.direction === 'input' ? `${currentTheme.success}15` : 
                                 pin.direction === 'output' ? `${currentTheme.error}15` : 
                                 `${currentTheme.primary}15`,
                  border: `1px solid ${pin.direction === 'input' ? currentTheme.success : 
                                 pin.direction === 'output' ? currentTheme.error : 
                                 currentTheme.primary}`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: currentTheme.text.primary,
                }}
              >
                {pin.name} ({pin.direction})
              </div>
            ))}
          </div>
        </div>

        {cell.truthTable && (
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Truth Table</div>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '10px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: `${currentTheme.primary}15` }}>
                  {Object.keys(cell.truthTable[0]).map(key => (
                    <th
                      key={key}
                      style={{
                        padding: '4px',
                        border: `1px solid ${currentTheme.border}`,
                        color: currentTheme.text.primary,
                      }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cell.truthTable.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        style={{
                          padding: '4px',
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.secondary,
                          textAlign: 'center',
                        }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => addCellToCircuit(cell)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '500',
            width: '100%',
          }}
        >
          Add to Circuit
        </button>
      </div>
    );
  };

  // Render hierarchy details
  const renderHierarchyDetails = (hierarchy) => {
    return (
      <div
        style={{
          backgroundColor: currentTheme.surface,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
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
          Hierarchy Details
        </div>

        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Description</div>
          <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{hierarchy.description}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Width</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{hierarchy.width} units</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Height</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{hierarchy.height} units</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Cells</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{hierarchy.cells.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: currentTheme.text.secondary }}>Area</div>
            <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>{hierarchy.width * hierarchy.height} units²</div>
          </div>
        </div>

        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Component Cells</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {hierarchy.cells.map((cell, index) => (
              <div
                key={index}
                style={{
                  padding: '2px 6px',
                  backgroundColor: `${currentTheme.primary}15`,
                  border: `1px solid ${currentTheme.primary}`,
                  borderRadius: '4px',
                  fontSize: '9px',
                  color: currentTheme.primary,
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: currentTheme.text.secondary, marginBottom: '4px' }}>Interfaces</div>
          <div style={{ fontSize: '12px', color: currentTheme.text.primary }}>
            {hierarchy.interfaces.map((iface, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <strong>{iface.name}</strong> ({iface.direction})
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => addHierarchyToCircuit(hierarchy)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '500',
            width: '100%',
          }}
        >
          Add to Circuit
        </button>
      </div>
    );
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
          <span style={{ fontSize: '20px' }}>Lib</span>
          Standard Cell Library
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search cells..."
            value={libraryData.searchQuery}
            onChange={(e) => setLibraryData(prev => ({ ...prev, searchQuery: e.target.value }))}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              fontSize: '11px',
              color: currentTheme.text.primary,
            }}
          />
          
          <select
            value={libraryData.categoryFilter}
            onChange={(e) => setLibraryData(prev => ({ ...prev, categoryFilter: e.target.value }))}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              fontSize: '11px',
              color: currentTheme.text.primary,
            }}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Library Content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            borderBottom: `1px solid ${currentTheme.border}`,
            paddingBottom: '8px',
          }}
        >
          <button
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            Standard Cells
          </button>
          
          <button
            style={{
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: currentTheme.text.secondary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
            }}
          >
            Hierarchical Designs
          </button>
        </div>

        {/* Standard Cells Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            overflow: 'auto',
            maxHeight: '300px',
          }}
        >
          {getFilteredCells().map(cell => (
            <div
              key={cell.id}
              style={{
                backgroundColor: currentTheme.surface,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setLibraryData(prev => ({ ...prev, selectedCell: cell, selectedHierarchy: null }))}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
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
                  {cell.name}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    backgroundColor: `${currentTheme.primary}15`,
                    color: currentTheme.primary,
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}
                >
                  {cell.category}
                </div>
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: currentTheme.text.secondary,
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}
              >
                {cell.description}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '9px',
                  color: currentTheme.text.secondary,
                }}
              >
                <span>{cell.width}×{cell.height}</span>
                <span>{cell.delay}ns</span>
                <span>{cell.power}mW</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cell Details */}
        {libraryData.selectedCell && renderCellDetails(libraryData.selectedCell)}
        
        {/* Hierarchy Details */}
        {libraryData.selectedHierarchy && renderHierarchyDetails(libraryData.selectedHierarchy)}
      </div>
    </div>
  );
};

export default StandardCellLibrary;
