import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCircuitStore from '../../store/useCircuitStore';

const VerilogIntegration = () => {
  const { currentTheme } = useTheme();
  const { nodes, edges, addNode, addEdge, setNodes, setEdges } = useCircuitStore();
  
  const [verilogCode, setVerilogCode] = useState('');
  const [importMode, setImportMode] = useState('module');
  const [exportOptions, setExportOptions] = useState({
    includeComments: true,
    includeTiming: false,
    includeTestbench: false,
    formatStyle: 'standard'
  });

  // Verilog templates
  const verilogTemplates = [
    {
      id: 'basic_gate',
      name: 'Basic Gate Module',
      description: 'Template for simple logic gates',
      code: `module basic_gate(
    input a,
    input b,
    output y
);
    // Gate implementation here
    assign y = a & b; // AND gate example
endmodule`,
      category: 'combinational'
    },
    {
      id: 'full_adder',
      name: 'Full Adder',
      description: '1-bit full adder with carry',
      code: `module full_adder(
    input a,
    input b,
    input cin,
    output sum,
    output cout
);
    assign sum = a ^ b ^ cin;
    assign cout = (a & b) | (b & cin) | (a & cin);
endmodule`,
      category: 'combinational'
    },
    {
      id: 'd_flip_flop',
      name: 'D Flip-Flop',
      description: 'Edge-triggered D flip-flop',
      code: `module d_flip_flop(
    input clk,
    input rst,
    input d,
    output reg q
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            q <= 1'b0;
        else
            q <= d;
    end
endmodule`,
      category: 'sequential'
    },
    {
      id: 'counter',
      name: '4-bit Counter',
      description: 'Synchronous 4-bit counter',
      code: `module counter_4bit(
    input clk,
    input rst,
    input enable,
    output reg [3:0] count
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            count <= 4'b0000;
        else if (enable)
            count <= count + 1;
    end
endmodule`,
      category: 'sequential'
    },
    {
      id: 'multiplexer',
      name: '4-to-1 MUX',
      description: '4-to-1 multiplexer',
      code: `module mux_4to1(
    input [3:0] data_in,
    input [1:0] sel,
    output data_out
);
    assign data_out = sel[1] ? 
                     (sel[0] ? data_in[3] : data_in[2]) :
                     (sel[0] ? data_in[1] : data_in[0]);
endmodule`,
      category: 'combinational'
    }
  ];

  // Parse Verilog to circuit
  const parseVerilogToCircuit = (verilogText) => {
    try {
      const moduleInfo = parseModule(verilogText);
      if (!moduleInfo) {
        throw new Error('Invalid Verilog module syntax');
      }

      // Clear existing circuit
      setNodes([]);
      setEdges([]);

      // Create input nodes
      const inputNodes = {};
      const inputY = 100;
      moduleInfo.inputs.forEach((input, index) => {
        const nodeId = `input_${input}`;
        inputNodes[input] = nodeId;
        addNode({
          id: nodeId,
          type: 'INPUT',
          position: { x: 50, y: inputY + index * 60 },
          data: { label: 'INPUT', value: false, name: input }
        });
      });

      // Create output nodes
      const outputNodes = {};
      const outputY = 100;
      moduleInfo.outputs.forEach((output, index) => {
        const nodeId = `output_${output}`;
        outputNodes[output] = nodeId;
        addNode({
          id: nodeId,
          type: 'OUTPUT',
          position: { x: 500, y: outputY + index * 60 },
          data: { label: 'OUTPUT', value: false, name: output }
        });
      });

      // Parse and create internal logic based on assignments
      moduleInfo.assignments.forEach((assignment, index) => {
        createLogicFromAssignment(assignment, inputNodes, outputNodes, index);
      });

      // Parse always blocks for sequential logic
      moduleInfo.alwaysBlocks.forEach((alwaysBlock, index) => {
        createSequentialFromAlways(alwaysBlock, inputNodes, outputNodes, index);
      });

      return {
        success: true,
        message: `Successfully imported module: ${moduleInfo.name}`,
        info: moduleInfo
      };

    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error.message}`,
        error: error.message
      };
    }
  };

  // Parse module structure
  const parseModule = (verilogText) => {
    const moduleMatch = verilogText.match(/module\s+(\w+)\s*\(([^)]*)\)/);
    if (!moduleMatch) return null;

    const moduleName = moduleMatch[1];
    const portList = moduleMatch[2].split(',').map(p => p.trim()).filter(p => p);

    const inputs = [];
    const outputs = [];
    const assignments = [];
    const alwaysBlocks = [];

    // Parse port declarations
    const inputMatches = verilogText.match(/input\s+(?:\[[^\]]+\]\s+)?(\w+)/g);
    const outputMatches = verilogText.match(/output\s+(?:\[[^\]]+\]\s+)?(\w+)/g);

    if (inputMatches) {
      inputs.push(...inputMatches.map(m => m.replace(/input\s+(?:\[[^\]]+\]\s+)?/, '')));
    }
    if (outputMatches) {
      outputs.push(...outputMatches.map(m => m.replace(/output\s+(?:\[[^\]]+\]\s+)?/, '')));
    }

    // Parse assignments
    const assignMatches = verilogText.match(/assign\s+(\w+)\s*=\s*([^;]+);/g);
    if (assignMatches) {
      assignMatches.forEach(assign => {
        const parts = assign.match(/assign\s+(\w+)\s*=\s*([^;]+);/);
        if (parts) {
          assignments.push({
            target: parts[1],
            expression: parts[2].trim()
          });
        }
      });
    }

    // Parse always blocks
    const alwaysMatches = verilogText.match(/always\s*@?\s*\([^)]+\)\s*begin\s*([\s\S]*?)\s*end/g);
    if (alwaysMatches) {
      alwaysMatches.forEach((alwaysBlock, index) => {
        const sensitivityMatch = alwaysBlock.match(/always\s*@?\s*\(([^)]+)\)/);
        const bodyMatch = alwaysBlock.match(/begin\s*([\s\S]*?)\s*end/);
        
        if (sensitivityMatch && bodyMatch) {
          alwaysBlocks.push({
            sensitivity: sensitivityMatch[1].trim(),
            body: bodyMatch[1].trim(),
            id: `always_${index}`
          });
        }
      });
    }

    return {
      name: moduleName,
      inputs,
      outputs,
      assignments,
      alwaysBlocks,
      portList
    };
  };

  // Create logic from assignment
  const createLogicFromAssignment = (assignment, inputNodes, outputNodes, index) => {
    const { target, expression } = assignment;
    
    // Simple expression parsing for basic gates
    if (expression.includes('&')) {
      // AND gate
      const operands = expression.split('&').map(op => op.trim().replace(/\s+/g, ''));
      createGate('AND', operands, target, inputNodes, outputNodes, index);
    } else if (expression.includes('|')) {
      // OR gate
      const operands = expression.split('|').map(op => op.trim().replace(/\s+/g, ''));
      createGate('OR', operands, target, inputNodes, outputNodes, index);
    } else if (expression.includes('^')) {
      // XOR gate
      const operands = expression.split('^').map(op => op.trim().replace(/\s+/g, ''));
      createGate('XOR', operands, target, inputNodes, outputNodes, index);
    } else if (expression.includes('~')) {
      // NOT gate
      const operand = expression.replace('~', '').trim().replace(/\s+/g, '');
      createGate('NOT', [operand], target, inputNodes, outputNodes, index);
    } else {
      // Direct connection
      const sourceNode = inputNodes[expression] || outputNodes[expression];
      const targetNode = outputNodes[target];
      
      if (sourceNode && targetNode) {
        addEdge({
          id: `edge_${Date.now()}_${index}`,
          source: sourceNode,
          target: targetNode
        });
      }
    }
  };

  // Create gate from operands
  const createGate = (gateType, operands, target, inputNodes, outputNodes, index) => {
    const gateId = `gate_${gateType.toLowerCase()}_${index}`;
    const gateX = 250;
    const gateY = 150 + index * 80;

    // Create gate node
    addNode({
      id: gateId,
      type: gateType,
      position: { x: gateX, y: gateY },
      data: { label: gateType, value: false }
    });

    // Connect inputs
    operands.forEach((operand, opIndex) => {
      const sourceNode = inputNodes[operand] || outputNodes[operand];
      if (sourceNode) {
        addEdge({
          id: `edge_${gateId}_input_${opIndex}`,
          source: sourceNode,
          target: gateId
        });
      }
    });

    // Connect output
    const targetNode = outputNodes[target];
    if (targetNode) {
      addEdge({
        id: `edge_${gateId}_output`,
        source: gateId,
        target: targetNode
      });
    }
  };

  // Create sequential logic from always block
  const createSequentialFromAlways = (alwaysBlock, inputNodes, outputNodes, index) => {
    const { sensitivity, body } = alwaysBlock;
    
    if (sensitivity.includes('posedge clk')) {
      // Clock-driven sequential logic
      const ffId = `ff_${index}`;
      const ffX = 300;
      const ffY = 150 + index * 80;

      // Create D flip-flop
      addNode({
        id: ffId,
        type: 'D_FLIP_FLOP',
        position: { x: ffX, y: ffY },
        data: { label: 'D_FLIP_FLOP', value: false }
      });

      // Connect clock
      const clockNode = inputNodes['clk'];
      if (clockNode) {
        addEdge({
          id: `edge_${ffId}_clk`,
          source: clockNode,
          target: ffId
        });
      }

      // Parse body for connections
      const assignmentMatch = body.match(/(\w+)\s*<=\s*([^;]+)/);
      if (assignmentMatch) {
        const target = assignmentMatch[1];
        const source = assignmentMatch[2].trim();

        // Connect D input
        const sourceNode = inputNodes[source] || outputNodes[source];
        if (sourceNode) {
          addEdge({
            id: `edge_${ffId}_d`,
            source: sourceNode,
            target: ffId
          });
        }

        // Connect Q output
        const targetNode = outputNodes[target];
        if (targetNode) {
          addEdge({
            id: `edge_${ffId}_q`,
            source: ffId,
            target: targetNode
          });
        }
      }
    }
  };

  // Export circuit to Verilog
  const exportCircuitToVerilog = () => {
    try {
      const verilog = generateVerilogFromCircuit();
      setVerilogCode(verilog);
      return verilog;
    } catch (error) {
      console.error('Export error:', error);
      return `// Export Error: ${error.message}`;
    }
  };

  // Generate Verilog from circuit
  const generateVerilogFromCircuit = () => {
    const inputNodes = nodes.filter(n => n.data.label === 'INPUT');
    const outputNodes = nodes.filter(n => n.data.label === 'OUTPUT');
    const internalNodes = nodes.filter(n => 
      !['INPUT', 'OUTPUT'].includes(n.data.label)
    );

    let verilog = '';

    // Add header comments
    if (exportOptions.includeComments) {
      verilog += `// Generated by Chip Designer
// Created: ${new Date().toISOString()}
// Nodes: ${nodes.length}
// Edges: ${edges.length}
//
`;
    }

    // Module declaration
    const moduleName = 'circuit_design';
    const allPorts = [...inputNodes, ...outputNodes];
    verilog += `module ${moduleName}(\n`;
    
    allPorts.forEach((node, index) => {
      const comma = index < allPorts.length - 1 ? ',' : '';
      verilog += `    ${node.data.name || node.id}${comma}\n`;
    });
    
    verilog += `);\n\n`;

    // Port declarations
    if (inputNodes.length > 0) {
      verilog += `    // Inputs\n`;
      inputNodes.forEach(node => {
        verilog += `    input ${node.data.name || node.id};\n`;
      });
      verilog += `\n`;
    }

    if (outputNodes.length > 0) {
      verilog += `    // Outputs\n`;
      outputNodes.forEach(node => {
        verilog += `    output ${node.data.name || node.id};\n`;
      });
      verilog += `\n`;
    }

    // Internal wires
    if (internalNodes.length > 0) {
      verilog += `    // Internal wires\n`;
      internalNodes.forEach(node => {
        verilog += `    wire ${node.id};\n`;
      });
      verilog += `\n`;
    }

    // Gate implementations
    verilog += `    // Gate implementations\n`;
    internalNodes.forEach(node => {
      const gateVerilog = generateGateVerilog(node);
      verilog += gateVerilog;
    });

    // Module end
    verilog += `endmodule\n`;

    // Add testbench if requested
    if (exportOptions.includeTestbench) {
      verilog += generateTestbench(moduleName, inputNodes, outputNodes);
    }

    return verilog;
  };

  // Generate Verilog for individual gate
  const generateGateVerilog = (node) => {
    const inputEdges = edges.filter(e => e.target === node.id);
    const outputEdges = edges.filter(e => e.source === node.id);

    if (inputEdges.length === 0) return '';

    const inputs = inputEdges.map(e => {
      const sourceNode = nodes.find(n => n.id === e.source);
      return sourceNode ? (sourceNode.data.name || sourceNode.id) : 'unknown';
    });

    const output = node.id;

    switch (node.data.label) {
      case 'AND':
        if (inputs.length === 2) {
          return `    assign ${output} = ${inputs[0]} & ${inputs[1]};\n`;
        }
        break;
      case 'OR':
        if (inputs.length === 2) {
          return `    assign ${output} = ${inputs[0]} | ${inputs[1]};\n`;
        }
        break;
      case 'NOT':
        if (inputs.length === 1) {
          return `    assign ${output} = ~${inputs[0]};\n`;
        }
        break;
      case 'XOR':
        if (inputs.length === 2) {
          return `    assign ${output} = ${inputs[0]} ^ ${inputs[1]};\n`;
        }
        break;
      case 'NAND':
        if (inputs.length === 2) {
          return `    assign ${output} = ~(${inputs[0]} & ${inputs[1]});\n`;
        }
        break;
      case 'NOR':
        if (inputs.length === 2) {
          return `    assign ${output} = ~(${inputs[0]} | ${inputs[1]});\n`;
        }
        break;
      case 'XNOR':
        if (inputs.length === 2) {
          return `    assign ${output} = ~(${inputs[0]} ^ ${inputs[1]});\n`;
        }
        break;
      default:
        return `    // ${node.data.label} implementation needed\n`;
    }

    return '';
  };

  // Generate testbench
  const generateTestbench = (moduleName, inputNodes, outputNodes) => {
    let testbench = `\n// Testbench
module ${moduleName}_tb;
    reg `;
    
    // Input declarations
    testbench += inputNodes.map(n => n.data.name || n.id).join(', ');
    testbench += `;\n    wire `;
    
    // Output declarations
    testbench += outputNodes.map(n => n.data.name || n.id).join(', ');
    testbench += `;\n\n`;
    
    // Module instantiation
    testbench += `    // Instantiate the circuit\n    ${moduleName} uut (\n`;
    
    [...inputNodes, ...outputNodes].forEach((node, index) => {
      const comma = index < (inputNodes.length + outputNodes.length - 1) ? ',' : '';
      testbench += `        .${node.data.name || node.id}(${node.data.name || node.id})${comma}\n`;
    });
    
    testbench += `    );\n\n`;
    
    // Test stimulus
    testbench += `    // Test stimulus
    initial begin\n`;
    
    // Generate test patterns for inputs
    const inputCount = inputNodes.length;
    const testPatterns = Math.min(16, Math.pow(2, inputCount));
    
    for (let i = 0; i < testPatterns; i++) {
      testbench += `        // Test case ${i + 1}\n`;
      inputNodes.forEach((node, index) => {
        const value = (i >> index) & 1;
        testbench += `        ${node.data.name || node.id} = 1'b${value};\n`;
      });
      testbench += `        #10;\n\n`;
    }
    
    testbench += `        $finish;
    end\n\n`;
    
    // Monitor outputs
    testbench += `    // Monitor outputs\n    initial begin\n`;
    testbench += `        $monitor("Time = %0d, `;
    testbench += [...inputNodes, ...outputNodes].map(n => `${n.data.name || n.id} = %b`).join(', ');
    testbench += `", $time, `;
    testbench += [...inputNodes, ...outputNodes].map(n => n.data.name || n.id).join(', ');
    testbench += `);\n    end\n\nendmodule\n`;
    
    return testbench;
  };

  // Import Verilog file
  const importVerilogFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setVerilogCode(content);
      const result = parseVerilogToCircuit(content);
      console.log('Import result:', result);
    };
    reader.readAsText(file);
  };

  // Export Verilog file
  const exportVerilogFile = () => {
    const verilog = exportCircuitToVerilog();
    const blob = new Blob([verilog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuit.v';
    a.click();
    URL.revokeObjectURL(url);
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
          <span style={{ fontSize: '20px' }}>V</span>
          Verilog Integration
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => parseVerilogToCircuit(verilogCode)}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Import Verilog
          </button>

          <button
            onClick={exportCircuitToVerilog}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.secondary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Export to Verilog
          </button>

          <button
            onClick={exportVerilogFile}
            style={{
              padding: '6px 12px',
              backgroundColor: currentTheme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            Download .v File
          </button>
        </div>
      </div>

      {/* Verilog Content */}
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
        {/* Templates */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '12px',
            }}
          >
            Verilog Templates
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}
          >
            {verilogTemplates.map(template => (
              <div
                key={template.id}
                style={{
                  backgroundColor: currentTheme.surface,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setVerilogCode(template.code)}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: currentTheme.text.primary,
                    marginBottom: '4px',
                  }}
                >
                  {template.name}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  {template.description}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: currentTheme.primary,
                    textTransform: 'uppercase',
                  }}
                >
                  {template.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
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
            Verilog Code Editor
          </div>

          <textarea
            value={verilogCode}
            onChange={(e) => setVerilogCode(e.target.value)}
            placeholder="Enter Verilog code here or select a template..."
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: currentTheme.surface,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: currentTheme.text.primary,
              resize: 'none',
              lineHeight: '1.4',
            }}
          />
        </div>

        {/* Export Options */}
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Export Options
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
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={exportOptions.includeComments}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                />
                Include comments
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={exportOptions.includeTiming}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTiming: e.target.checked }))}
                />
                Include timing info
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: currentTheme.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={exportOptions.includeTestbench}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTestbench: e.target.checked }))}
                />
                Include testbench
              </label>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  Format style
                </label>
                <select
                  value={exportOptions.formatStyle}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, formatStyle: e.target.value }))}
                  style={{
                    padding: '4px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: currentTheme.text.primary,
                  }}
                >
                  <option value="standard">Standard</option>
                  <option value="compact">Compact</option>
                  <option value="verbose">Verbose</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerilogIntegration;
