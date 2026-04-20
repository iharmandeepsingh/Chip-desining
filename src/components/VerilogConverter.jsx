import React, { useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const VerilogConverter = () => {
  const [verilogCode, setVerilogCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const { addNode, addEdge, clearCircuit } = useCircuitStore();

  const parseVerilog = (code) => {
    try {
      setError('');
      setIsProcessing(true);
      
      // Clear existing circuit
      clearCircuit();
      
      // Simple Verilog parser for basic gates
      const lines = code.split('\n').filter(line => line.trim());
      const nodeMap = new Map();
      const edgeList = [];
      let nodeId = 0;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
          return;
        }
        
        // Parse module declaration
        if (trimmedLine.startsWith('module')) {
          const match = trimmedLine.match(/module\s+(\w+)\s*\(/);
          if (match) {
            console.log(`Module: ${match[1]}`);
          }
          return;
        }
        
        // Parse wire declarations
        if (trimmedLine.startsWith('wire')) {
          const wires = trimmedLine.match(/wire\s+([^;]+);?/);
          if (wires) {
            const wireList = wires[1].split(',').map(w => w.trim());
            wireList.forEach(wire => {
              if (!nodeMap.has(wire)) {
                const nodeId_str = `node_${nodeId++}`;
                nodeMap.set(wire, nodeId_str);
                
                addNode({
                  id: nodeId_str,
                  type: 'gate',
                  position: { x: 100 + (nodeId * 50), y: 100 + (nodeId * 30) },
                  data: { label: 'WIRE', value: false }
                });
              }
            });
          }
          return;
        }
        
        // Parse gate assignments
        if (trimmedLine.includes('=') && !trimmedLine.startsWith('module')) {
          const assignMatch = trimmedLine.match(/(\w+)\s*=\s*([^;]+);?/);
          if (assignMatch) {
            const [output, expression] = assignMatch;
            
            // Parse simple gate expressions
            if (expression.includes('&')) {
              // AND gate
              const inputs = expression.split('&').map(i => i.trim());
              const gateId = `and_${nodeId++}`;
              
              // Create AND gate node
              addNode({
                id: gateId,
                type: 'gate',
                position: { x: 300, y: 100 + (nodeId * 50) },
                data: { label: 'AND', value: false }
              });
              
              // Connect inputs
              inputs.forEach(input => {
                if (nodeMap.has(input)) {
                  edgeList.push({
                    id: `edge_${edgeList.length}`,
                    source: nodeMap.get(input),
                    target: gateId
                  });
                }
              });
              
              // Connect output
              if (nodeMap.has(output)) {
                edgeList.push({
                  id: `edge_${edgeList.length}`,
                  source: gateId,
                  target: nodeMap.get(output)
                });
              }
              
              nodeMap.set(output, gateId);
            }
            else if (expression.includes('|')) {
              // OR gate
              const inputs = expression.split('|').map(i => i.trim());
              const gateId = `or_${nodeId++}`;
              
              addNode({
                id: gateId,
                type: 'gate',
                position: { x: 300, y: 100 + (nodeId * 50) },
                data: { label: 'OR', value: false }
              });
              
              inputs.forEach(input => {
                if (nodeMap.has(input)) {
                  edgeList.push({
                    id: `edge_${edgeList.length}`,
                    source: nodeMap.get(input),
                    target: gateId
                  });
                }
              });
              
              if (nodeMap.has(output)) {
                edgeList.push({
                  id: `edge_${edgeList.length}`,
                  source: gateId,
                  target: nodeMap.get(output)
                });
              }
              
              nodeMap.set(output, gateId);
            }
            else if (expression.includes('~')) {
              // NOT gate
              const input = expression.replace('~', '').trim();
              const gateId = `not_${nodeId++}`;
              
              addNode({
                id: gateId,
                type: 'gate',
                position: { x: 300, y: 100 + (nodeId * 50) },
                data: { label: 'NOT', value: false }
              });
              
              if (nodeMap.has(input)) {
                edgeList.push({
                  id: `edge_${edgeList.length}`,
                  source: nodeMap.get(input),
                  target: gateId
                });
              }
              
              if (nodeMap.has(output)) {
                edgeList.push({
                  id: `edge_${edgeList.length}`,
                  source: gateId,
                  target: nodeMap.get(output)
                });
              }
              
              nodeMap.set(output, gateId);
            }
            else if (expression.includes('^')) {
              // XOR gate
              const inputs = expression.split('^').map(i => i.trim());
              const gateId = `xor_${nodeId++}`;
              
              addNode({
                id: gateId,
                type: 'gate',
                position: { x: 300, y: 100 + (nodeId * 50) },
                data: { label: 'XOR', value: false }
              });
              
              inputs.forEach(input => {
                if (nodeMap.has(input)) {
                  edgeList.push({
                    id: `edge_${edgeList.length}`,
                    source: nodeMap.get(input),
                    target: gateId
                  });
                }
              });
              
              if (nodeMap.has(output)) {
                edgeList.push({
                  id: `edge_${edgeList.length}`,
                  source: gateId,
                  target: nodeMap.get(output)
                });
              }
              
              nodeMap.set(output, gateId);
            }
          }
        }
      });
      
      // Add all edges after parsing
      setTimeout(() => {
        edgeList.forEach(edge => addEdge(edge));
      }, 100);
      
      setIsProcessing(false);
      
    } catch (err) {
      setError(`Syntax error: ${err.message}`);
      setIsProcessing(false);
    }
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
        Verilog Converter
      </div>
      
      {/* Input area */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '600', 
          color: '#cbd5e1',
          marginBottom: '4px'
        }}>
          Input Verilog Code:
        </div>
        <textarea
          value={verilogCode}
          onChange={(e) => setVerilogCode(e.target.value)}
          placeholder="// Enter your Verilog code here...
// Example:
module half_adder(sum, cout, a, b);
  input a, b;
  output sum, cout;
  
  wire w1, w2, w3, w4;
  
  xor g1(w1, a, b);
  and g2(w2, a, b);
  and g3(w3, w1, b);
  or g4(w4, w2, w3);
  
  assign sum = w1;
  assign cout = w4;
endmodule"
          style={{
            width: '100%',
            height: '150px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            fontSize: '9px',
            fontFamily: 'monospace',
            padding: '8px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>
      
      {/* Error display */}
      {error && (
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '9px',
          marginBottom: '8px'
        }}>
          {error}
        </div>
      )}
      
      {/* Convert button */}
      <button
        onClick={() => parseVerilog(verilogCode)}
        disabled={!verilogCode.trim() || isProcessing}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: verilogCode.trim() && !isProcessing ? '#3b82f6' : '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: verilogCode.trim() && !isProcessing ? 'pointer' : 'not-allowed',
          fontSize: '10px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (verilogCode.trim() && !isProcessing) {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (verilogCode.trim() && !isProcessing) {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {isProcessing ? (
          <>
            <div style={{
              width: '12px',
              height: '12px',
              border: '2px solid white',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span>Convert to Circuit</span>
          </>
        )}
      </button>
      
      {/* Instructions */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '8px', 
        color: '#64748b', 
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        Supported: module, wire, assign statements
        <br />
        Gates: AND (&), OR (|), NOT (~), XOR (^)
      </div>
    </div>
  );
};

export default VerilogConverter;
