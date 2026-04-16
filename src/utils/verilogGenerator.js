export const generateVerilog = (nodes, edges) => {
  // Get input, output, and wire nodes
  const inputNodes = nodes.filter(node => node.data.label === 'INPUT');
  const outputNodes = nodes.filter(node => node.data.label === 'OUTPUT');
  const gateNodes = nodes.filter(node => 
    ['AND', 'OR', 'NOT'].includes(node.data.label)
  );

  // Generate module name
  const moduleName = `circuit_${Date.now().toString(36)}`;

  // Generate input declarations
  const inputs = inputNodes.map((node, index) => 
    `  input ${node.id.replace(/[^a-zA-Z0-9]/g, '_')},`
  );

  // Generate output declarations
  const outputs = outputNodes.map((node, index) => 
    `  output ${node.id.replace(/[^a-zA-Z0-9]/g, '_')},`
  );

  // Generate wire declarations for internal connections
  const wires = gateNodes.map(node => 
    `  wire ${node.id.replace(/[^a-zA-Z0-9]/g, '_')},`
  );

  // Generate gate instantiations
  const gateInstantiations = gateNodes.map(node => {
    const nodeName = node.id.replace(/[^a-zA-Z0-9]/g, '_');
    const gateType = node.data.label;
    
    // Get input connections for this gate
    const inputConnections = edges
      .filter(edge => edge.target === node.id)
      .map(edge => edge.source.replace(/[^a-zA-Z0-9]/g, '_'));

    // Get output connections for this gate
    const outputConnection = edges.find(edge => edge.source === node.id);
    const outputName = outputConnection 
      ? outputConnection.target.replace(/[^a-zA-Z0-9]/g, '_')
      : 'unused';

    switch (gateType) {
      case 'AND':
        if (inputConnections.length >= 2) {
          return `  and gate_${nodeName} (${outputName}, ${inputConnections[0]}, ${inputConnections[1]});`;
        }
        break;
      case 'OR':
        if (inputConnections.length >= 2) {
          return `  or gate_${nodeName} (${outputName}, ${inputConnections[0]}, ${inputConnections[1]});`;
        }
        break;
      case 'NOT':
        if (inputConnections.length >= 1) {
          return `  not gate_${nodeName} (${outputName}, ${inputConnections[0]});`;
        }
        break;
    }
    return `  // ${gateType} gate ${nodeName} - insufficient connections`;
  });

  // Build the Verilog code
  let verilogCode = `module ${moduleName} (\n`;
  
  // Add inputs
  if (inputs.length > 0) {
    verilogCode += inputs.join('\n') + '\n';
  }
  
  // Add outputs
  if (outputs.length > 0) {
    verilogCode += outputs.join('\n') + '\n';
  }
  
  // Remove trailing comma from last port
  verilogCode = verilogCode.replace(/,\s*$/, '');
  
  verilogCode += `);\n\n`;
  
  // Add wire declarations
  if (wires.length > 0) {
    verilogCode += wires.join('\n') + '\n';
    verilogCode = verilogCode.replace(/,\s*$/, ';\n\n');
  }
  
  // Add gate instantiations
  if (gateInstantiations.length > 0) {
    verilogCode += gateInstantiations.join('\n') + '\n';
  }
  
  verilogCode += `\nendmodule\n`;
  
  // Add testbench if there are inputs and outputs
  if (inputNodes.length > 0 && outputNodes.length > 0) {
    verilogCode += `\n// Testbench\n`;
    verilogCode += `module ${moduleName}_tb;\n`;
    verilogCode += `  reg ${inputNodes.map(n => n.id.replace(/[^a-zA-Z0-9]/g, '_')).join(', ')};\n`;
    verilogCode += `  wire ${outputNodes.map(n => n.id.replace(/[^a-zA-Z0-9]/g, '_')).join(', ')};\n\n`;
    verilogCode += `  ${moduleName} uut (\n`;
    
    // Connect inputs
    inputNodes.forEach(node => {
      verilogCode += `    .${node.id.replace(/[^a-zA-Z0-9]/g, '_')}(${node.id.replace(/[^a-zA-Z0-9]/g, '_')}),\n`;
    });
    
    // Connect outputs
    outputNodes.forEach((node, index) => {
      const isLast = index === outputNodes.length - 1;
      verilogCode += `    .${node.id.replace(/[^a-zA-Z0-9]/g, '_')}(${node.id.replace(/[^a-zA-Z0-9]/g, '_')})${isLast ? '' : ','}\n`;
    });
    
    verilogCode += `  );\n\n`;
    verilogCode += `  initial begin\n`;
    verilogCode += `    // Test all input combinations\n`;
    
    // Generate test cases
    const numInputs = inputNodes.length;
    if (numInputs > 0) {
      const totalCombinations = Math.pow(2, numInputs);
      for (let i = 0; i < totalCombinations; i++) {
        verilogCode += `    // Test case ${i + 1}\n`;
        inputNodes.forEach((node, inputIndex) => {
          const bitValue = (i >> (numInputs - 1 - inputIndex)) & 1;
          verilogCode += `    ${node.id.replace(/[^a-zA-Z0-9]/g, '_')} = ${bitValue};\n`;
        });
        verilogCode += `    #10;\n`;
      }
    }
    
    verilogCode += `    $finish;\n`;
    verilogCode += `  end\n\n`;
    verilogCode += `  initial begin\n`;
    verilogCode += `    $monitor("Time=%0d Inputs=${inputNodes.map(n => `%${n.id.replace(/[^a-zA-Z0-9]/g, '_')}`).join(' ')} Outputs=${outputNodes.map(n => `%${n.id.replace(/[^a-zA-Z0-9]/g, '_')}`).join(' ')}", $time, ${inputNodes.map(n => n.id.replace(/[^a-zA-Z0-9]/g, '_')).join(', ')}, ${outputNodes.map(n => n.id.replace(/[^a-zA-Z0-9]/g, '_')).join(', ')});\n`;
    verilogCode += `  end\n`;
    verilogCode += `endmodule\n`;
  }
  
  return verilogCode;
};

export const downloadVerilog = (nodes, edges) => {
  if (nodes.length === 0) {
    alert('No circuit to export');
    return;
  }

  const verilogCode = generateVerilog(nodes, edges);
  const blob = new Blob([verilogCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `circuit_${Date.now()}.v`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
