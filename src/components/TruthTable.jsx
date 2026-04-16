import React, { useState, useMemo } from 'react';
import useCircuitStore from '../store/useCircuitStore';

const TruthTable = () => {
  const { nodes, edges, computeNodeValue } = useCircuitStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get input nodes
  const inputNodes = useMemo(() => 
    nodes.filter(node => node.data.label === 'INPUT'),
    [nodes]
  );

  // Get output nodes
  const outputNodes = useMemo(() => 
    nodes.filter(node => node.data.label === 'OUTPUT'),
    [nodes]
  );

  // Generate all possible input combinations
  const generateInputCombinations = (numInputs) => {
    if (numInputs === 0) return [[]];
    
    const combinations = [];
    const totalCombinations = Math.pow(2, numInputs);
    
    for (let i = 0; i < totalCombinations; i++) {
      const combination = [];
      for (let j = numInputs - 1; j >= 0; j--) {
        combination.push((i >> j) & 1);
      }
      combinations.push(combination);
    }
    
    return combinations;
  };

  // Compute truth table data
  const truthTableData = useMemo(() => {
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      return [];
    }

    const combinations = generateInputCombinations(inputNodes.length);
    
    return combinations.map(combination => {
      // Temporarily set input values
      const originalValues = {};
      inputNodes.forEach((node, index) => {
        originalValues[node.id] = node.data.value;
        node.data.value = Boolean(combination[index]);
      });

      // Calculate outputs
      const outputs = outputNodes.map(node => ({
        id: node.id,
        label: node.data.label,
        value: computeNodeValue(node.id) ? 1 : 0
      }));

      // Restore original values
      inputNodes.forEach(node => {
        node.data.value = originalValues[node.id];
      });

      return {
        inputs: combination,
        outputs: outputs
      };
    });
  }, [inputNodes, outputNodes, computeNodeValue]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        Generate Truth Table
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxHeight: '80vh',
        overflow: 'auto',
        minWidth: '400px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Truth Table</h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      {inputNodes.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>
          Add INPUT and OUTPUT nodes to generate a truth table
        </p>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
            {inputNodes.length} input(s) × {outputNodes.length} output(s)
          </div>
          
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                {inputNodes.map(node => (
                  <th
                    key={node.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px 12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#2196F3',
                    }}
                  >
                    {node.data.label}
                  </th>
                ))}
                {outputNodes.map(node => (
                  <th
                    key={node.id}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px 12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: '#f44336',
                    }}
                  >
                    {node.data.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {truthTableData.map((row, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                  {row.inputs.map((input, inputIndex) => (
                    <td
                      key={inputIndex}
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px 12px',
                        textAlign: 'center',
                        fontWeight: input ? 'bold' : 'normal',
                        color: input ? '#2196F3' : '#666',
                      }}
                    >
                      {input}
                    </td>
                  ))}
                  {row.outputs.map((output, outputIndex) => (
                    <td
                      key={outputIndex}
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px 12px',
                        textAlign: 'center',
                        fontWeight: output.value ? 'bold' : 'normal',
                        backgroundColor: output.value ? '#e8f5e8' : 'transparent',
                        color: output.value ? '#2e7d32' : '#666',
                      }}
                    >
                      {output.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <strong>Legend:</strong> Blue = Inputs, Green = Outputs, Bold = Logic 1
          </div>
        </div>
      )}
    </div>
  );
};

export default TruthTable;
