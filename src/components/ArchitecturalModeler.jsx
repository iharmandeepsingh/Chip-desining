import React, { useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const ArchitecturalModeler = () => {
  const [busType, setBusType] = useState('wishbone');
  const [selectedUnits, setSelectedUnits] = useState(['alu', 'memory']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addNode, addEdge, clearCircuit } = useCircuitStore();

  const functionalUnits = [
    {
      id: 'alu',
      name: 'ALU',
      description: 'Arithmetic Logic Unit',
      ports: 8
    },
    {
      id: 'memory',
      name: 'Memory Controller',
      description: 'Main Memory Interface',
      ports: 16
    },
    {
      id: 'controller',
      name: 'Controller',
      description: 'Main Control Unit',
      ports: 12
    },
    {
      id: 'register_file',
      name: 'Register File',
      description: 'General Purpose Registers',
      ports: 20
    },
    {
      id: 'cache',
      name: 'Cache Controller',
      description: 'L1 Cache Management',
      ports: 24
    },
    {
      id: 'dma',
      name: 'DMA Controller',
      description: 'Direct Memory Access',
      ports: 16
    }
  ];

  const generateWishboneWrapper = () => {
    const selectedUnitsList = functionalUnits.filter(unit => selectedUnits.includes(unit.id));
    
    let code = '//==============================================================================\n';
    code += '// Top-Level Wrapper - Wishbone Bus Architecture\n';
    code += '// Generated: ' + new Date().toISOString() + '\n';
    code += '// Functional Units: ' + selectedUnitsList.map(u => u.name).join(', ') + '\n';
    code += '//==============================================================================\n\n';
    
    code += 'module top_level_wrapper (\n';
    code += '    // Global signals\n';
    code += '    input wire clk,\n';
    code += '    input wire rst_n,\n';
    code += '    \n';
    code += '    // Master interface (for external connection)\n';
    code += '    output wire [31:0] m_wb_adr_o,\n';
    code += '    output wire [31:0] m_wb_dat_o,\n';
    code += '    input wire [31:0] m_wb_dat_i,\n';
    code += '    output wire m_wb_cyc_o,\n';
    code += '    output wire m_wb_stb_o,\n';
    code += '    output wire m_wb_we_o,\n';
    code += '    output wire [3:0] m_wb_sel_o,\n';
    code += '    input wire m_wb_ack_i,\n';
    code += '    input wire m_wb_err_i,\n';
    code += '    \n';
    code += '    // Status and debug\n';
    code += '    output wire [7:0] status_leds,\n';
    code += '    output wire debug_clk\n';
    code += ');\n\n';
    
    code += '// Internal Wishbone bus signals\n';
    code += 'wire [31:0] wb_adr;\n';
    code += 'wire [31:0] wb_dat_m2s;\n';
    code += 'wire [31:0] wb_dat_s2m;\n';
    code += 'wire wb_cyc;\n';
    code += 'wire wb_stb;\n';
    code += 'wire wb_we;\n';
    code += 'wire [3:0] wb_sel;\n';
    code += 'wire wb_ack;\n';
    code += 'wire wb_err;\n\n';
    
    code += '// Clock and reset\n';
    code += 'assign debug_clk = clk;\n\n';
    
    // Generate functional unit instances
    selectedUnitsList.forEach((unit, index) => {
      const baseAddr = 0x10000000 + (index * 0x1000);
      code += '//==============================================================================\n';
      code += '// ' + unit.name + ' - ' + unit.description + '\n';
      code += '//==============================================================================\n';
      code += unit.id + '_wrapper #(\n';
      code += '    .BASE_ADDR(32\'h' + baseAddr.toString(16).toUpperCase() + ')\n';
      code += ') ' + unit.id + '_inst (\n';
      code += '    .clk(clk),\n';
      code += '    .rst_n(rst_n),\n';
      code += '    // Wishbone slave interface\n';
      code += '    .wb_adr_i(wb_adr),\n';
      code += '    .wb_dat_i(wb_dat_m2s),\n';
      code += '    .wb_dat_o(wb_dat_s2m),\n';
      code += '    .wb_cyc_i(wb_cyc),\n';
      code += '    .wb_stb_i(wb_stb),\n';
      code += '    .wb_we_i(wb_we),\n';
      code += '    .wb_sel_i(wb_sel),\n';
      code += '    .wb_ack_o(),\n';
      code += '    .wb_err_o()\n';
      code += ');\n\n';
    });
    
    code += '//==============================================================================\n';
    code += '// Master Interface Connection\n';
    code += '//==============================================================================\n';
    code += 'assign m_wb_adr_o = wb_adr;\n';
    code += 'assign m_wb_dat_o = wb_dat_m2s;\n';
    code += 'assign wb_dat_s2m = m_wb_dat_i;\n';
    code += 'assign m_wb_cyc_o = wb_cyc;\n';
    code += 'assign m_wb_stb_o = wb_stb;\n';
    code += 'assign m_wb_we_o = wb_we;\n';
    code += 'assign m_wb_sel_o = wb_sel;\n';
    code += 'assign wb_ack = m_wb_ack_i;\n';
    code += 'assign wb_err = m_wb_err_i;\n\n';
    
    code += 'endmodule\n';
    
    return code;
  };

  const generateAMBAWrapper = () => {
    const selectedUnitsList = functionalUnits.filter(unit => selectedUnits.includes(unit.id));
    
    let code = '//==============================================================================\n';
    code += '// Top-Level Wrapper - AMBA AHB Bus Architecture\n';
    code += '// Generated: ' + new Date().toISOString() + '\n';
    code += '// Functional Units: ' + selectedUnitsList.map(u => u.name).join(', ') + '\n';
    code += '//==============================================================================\n\n';
    
    code += 'module top_level_wrapper (\n';
    code += '    // Global signals\n';
    code += '    input wire clk,\n';
    code += '    input wire rst_n,\n';
    code += '    \n';
    code += '    // AHB master interface\n';
    code += '    output wire [31:0] m_ahb_haddr,\n';
    code += '    output wire [31:0] m_ahb_hwdata,\n';
    code += '    input wire [31:0] m_ahb_hrdata,\n';
    code += '    output wire [2:0] m_ahb_htrans,\n';
    code += '    output wire [2:0] m_ahb_hburst,\n';
    code += '    output wire [3:0] m_ahb_hprot,\n';
    code += '    output wire [1:0] m_ahb_hsize,\n';
    code += '    output wire m_ahb_hwrite,\n';
    code += '    output wire m_ahb_hmastlock,\n';
    code += '    input wire m_ahb_hready,\n';
    code += '    input wire m_ahb_hresp,\n';
    code += '    \n';
    code += '    // Status and debug\n';
    code += '    output wire [7:0] status_leds,\n';
    code += '    output wire debug_clk\n';
    code += ');\n\n';
    
    code += '// Internal AHB bus signals\n';
    code += 'wire [31:0] ahb_haddr;\n';
    code += 'wire [31:0] ahb_hwdata;\n';
    code += 'wire [31:0] ahb_hrdata;\n';
    code += 'wire [2:0] ahb_htrans;\n';
    code += 'wire [2:0] ahb_hburst;\n';
    code += 'wire [3:0] ahb_hprot;\n';
    code += 'wire [1:0] ahb_hsize;\n';
    code += 'wire ahb_hwrite;\n';
    code += 'wire ahb_hmastlock;\n';
    code += 'wire ahb_hready;\n';
    code += 'wire ahb_hresp;\n\n';
    
    code += '// Clock and reset\n';
    code += 'assign debug_clk = clk;\n\n';
    
    // Generate functional unit instances
    selectedUnitsList.forEach((unit, index) => {
      const baseAddr = 0x40000000 + (index * 0x100000);
      code += '//==============================================================================\n';
      code += '// ' + unit.name + ' - ' + unit.description + '\n';
      code += '//==============================================================================\n';
      code += unit.id + '_ahb_wrapper #(\n';
      code += '    .BASE_ADDR(32\'h' + baseAddr.toString(16).toUpperCase() + '),\n';
      code += '    .SLAVE_NUM(' + index + ')\n';
      code += ') ' + unit.id + '_inst (\n';
      code += '    .clk(clk),\n';
      code += '    .rst_n(rst_n),\n';
      code += '    // AHB slave interface\n';
      code += '    .haddr_i(ahb_haddr),\n';
      code += '    .hwdata_i(ahb_hwdata),\n';
      code += '    .hrdata_o(ahb_hrdata),\n';
      code += '    .htrans_i(ahb_htrans),\n';
      code += '    .hburst_i(ahb_hburst),\n';
      code += '    .hprot_i(ahb_hprot),\n';
      code += '    .hsize_i(ahb_hsize),\n';
      code += '    .hwrite_i(ahb_hwrite),\n';
      code += '    .hmastlock_i(ahb_hmastlock),\n';
      code += '    .hready_i(ahb_hready),\n';
      code += '    .hresp_o()\n';
      code += ');\n\n';
    });
    
    code += '//==============================================================================\n';
    code += '// Master Interface Connection\n';
    code += '//==============================================================================\n';
    code += 'assign m_ahb_haddr = ahb_haddr;\n';
    code += 'assign m_ahb_hwdata = ahb_hwdata;\n';
    code += 'assign ahb_hrdata = m_ahb_hrdata;\n';
    code += 'assign m_ahb_htrans = ahb_htrans;\n';
    code += 'assign m_ahb_hburst = ahb_hburst;\n';
    code += 'assign m_ahb_hprot = ahb_hprot;\n';
    code += 'assign m_ahb_hsize = ahb_hsize;\n';
    code += 'assign m_ahb_hwrite = ahb_hwrite;\n';
    code += 'assign m_ahb_hmastlock = ahb_hmastlock;\n';
    code += 'assign ahb_hready = m_ahb_hready;\n';
    code += 'assign ahb_hresp = m_ahb_hresp;\n\n';
    
    code += 'endmodule\n';
    
    return code;
  };

  const generateCode = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const code = busType === 'wishbone' ? generateWishboneWrapper() : generateAMBAWrapper();
      setGeneratedCode(code);
      setIsGenerating(false);
    }, 1000);
  };

  const generateCircuit = () => {
    clearCircuit();
    const selectedUnitsList = functionalUnits.filter(unit => selectedUnits.includes(unit.id));
    
    // Create bus controller node
    const busNodeId = `bus_${Date.now()}`;
    addNode({
      id: busNodeId,
      type: 'gate',
      position: { x: 400, y: 200 },
      data: { label: busType === 'wishbone' ? 'Wishbone Bus' : 'AMBA Bus', value: false }
    });

    // Create functional unit nodes
    selectedUnitsList.forEach((unit, index) => {
      const angle = (index * 2 * Math.PI) / selectedUnitsList.length;
      const radius = 150;
      const x = 400 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);
      
      const unitNodeId = `${unit.id}_${Date.now()}`;
      addNode({
        id: unitNodeId,
        type: 'gate',
        position: { x, y },
        data: { label: unit.name, value: false }
      });

      // Connect to bus
      setTimeout(() => {
        addEdge({
          id: `edge_${unit.id}_${Date.now()}`,
          source: busNodeId,
          target: unitNodeId
        });
      }, 100);
    });

    // Add master interface node
    const masterNodeId = `master_${Date.now()}`;
    addNode({
      id: masterNodeId,
      type: 'gate',
      position: { x: 400, y: 50 },
      data: { label: 'Master Interface', value: false }
    });

    setTimeout(() => {
      addEdge({
        id: `edge_master_${Date.now()}`,
        source: masterNodeId,
        target: busNodeId
      });
    }, 200);
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'transparent',
      padding: '0px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: '700', 
        color: '#f8fafc',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Architectural Modeler
      </div>
      
      {/* Bus Type Selection */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Bus Architecture:
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setBusType('wishbone')}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: busType === 'wishbone' ? '#3b82f6' : '#1e293b',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Wishbone
          </button>
          <button
            onClick={() => setBusType('amba')}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: busType === 'amba' ? '#3b82f6' : '#1e293b',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            AMBA AHB
          </button>
        </div>
      </div>

      {/* Functional Units Selection */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Functional Units:
        </div>
        <div style={{ 
          maxHeight: '120px', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px'
        }}>
          {functionalUnits.map(unit => (
            <label
              key={unit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '8px',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedUnits.includes(unit.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUnits([...selectedUnits, unit.id]);
                  } else {
                    setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                  }
                }}
                style={{
                  width: '12px',
                  height: '12px'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#f8fafc' }}>
                  {unit.name}
                </div>
                <div style={{ fontSize: '7px', color: '#94a3b8' }}>
                  {unit.description} ({unit.ports} ports)
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Generate Buttons */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button
          onClick={generateCode}
          disabled={selectedUnits.length === 0 || isGenerating}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: selectedUnits.length > 0 && !isGenerating ? '#10b981' : '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '9px',
            fontWeight: '600',
            cursor: selectedUnits.length > 0 && !isGenerating ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          {isGenerating ? (
            <>
              <div style={{
                width: '10px',
                height: '10px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Generate</span>
              <span>Code</span>
            </>
          )}
        </button>
        <button
          onClick={generateCircuit}
          disabled={selectedUnits.length === 0}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: selectedUnits.length > 0 ? '#8b5cf6' : '#374151',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '9px',
            fontWeight: '600',
            cursor: selectedUnits.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <span>Generate</span>
          <span>Circuit</span>
        </button>
      </div>

      {/* Generated Code Display */}
      {generatedCode && (
        <div style={{ 
          marginTop: '8px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '8px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ 
            fontSize: '9px', 
            fontWeight: '600', 
            color: '#f8fafc',
            marginBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Generated Verilog Code:</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
              }}
              style={{
                padding: '2px 6px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                fontSize: '7px',
                cursor: 'pointer'
              }}
            >
              Copy
            </button>
          </div>
          <pre style={{ 
            fontSize: '7px', 
            color: '#94a3b8',
            margin: 0,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.3'
          }}>
            {generatedCode}
          </pre>
        </div>
      )}

      {/* Info */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '7px', 
        color: '#64748b', 
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        Select functional units and generate top-level wrapper
        <br />
        Treat 10,000+ gates as single high-level component
      </div>
    </div>
  );
};

export default ArchitecturalModeler;
