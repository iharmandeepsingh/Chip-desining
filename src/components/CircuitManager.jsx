import React, { useState } from 'react';
import useCircuitStore from '../store/useCircuitStore';
import { downloadVerilog } from '../utils/verilogGenerator';

const CircuitManager = () => {
  const { nodes, edges, setNodes, setEdges, clearCircuit } = useCircuitStore();
  const [savedCircuits, setSavedCircuits] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  // Load saved circuits from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('chipDesigner_circuits');
    if (saved) {
      setSavedCircuits(JSON.parse(saved));
    }
  }, []);

  // Save circuit to localStorage
  const saveCircuit = () => {
    const circuitName = prompt('Enter circuit name:');
    if (!circuitName) return;

    const circuit = {
      id: Date.now().toString(),
      name: circuitName,
      nodes: nodes,
      edges: edges,
      createdAt: new Date().toISOString(),
    };

    const updatedCircuits = [...savedCircuits, circuit];
    setSavedCircuits(updatedCircuits);
    localStorage.setItem('chipDesigner_circuits', JSON.stringify(updatedCircuits));
    
    alert(`Circuit "${circuitName}" saved successfully!`);
  };

  // Load circuit from localStorage
  const loadCircuit = (circuit) => {
    if (window.confirm(`Load circuit "${circuit.name}"? This will replace your current circuit.`)) {
      setNodes(circuit.nodes);
      setEdges(circuit.edges);
      setShowSaved(false);
    }
  };

  // Delete saved circuit
  const deleteCircuit = (circuitId) => {
    const circuit = savedCircuits.find(c => c.id === circuitId);
    if (window.confirm(`Delete circuit "${circuit.name}"?`)) {
      const updatedCircuits = savedCircuits.filter(c => c.id !== circuitId);
      setSavedCircuits(updatedCircuits);
      localStorage.setItem('chipDesigner_circuits', JSON.stringify(updatedCircuits));
    }
  };

  // Export circuit as JSON
  const exportCircuit = () => {
    const circuitData = {
      name: 'circuit_export',
      nodes: nodes,
      edges: edges,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `circuit_${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import circuit from JSON file
  const importCircuit = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const circuitData = JSON.parse(event.target.result);
          if (circuitData.nodes && circuitData.edges) {
            if (window.confirm('Import circuit? This will replace your current circuit.')) {
              setNodes(circuitData.nodes);
              setEdges(circuitData.edges);
            }
          } else {
            alert('Invalid circuit file format');
          }
        } catch (error) {
          alert('Error importing circuit file');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-start' }}>
        <button
          onClick={saveCircuit}
          disabled={nodes.length === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: nodes.length > 0 ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Save Circuit
        </button>

        <button
          onClick={() => setShowSaved(!showSaved)}
          disabled={savedCircuits.length === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: savedCircuits.length > 0 ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: savedCircuits.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Load Circuit ({savedCircuits.length})
        </button>

        <button
          onClick={exportCircuit}
          disabled={nodes.length === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: nodes.length > 0 ? '#FF9800' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Export
        </button>

        <button
          onClick={() => downloadVerilog(nodes, edges)}
          disabled={nodes.length === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: nodes.length > 0 ? '#607D8B' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Export Verilog
        </button>

        <button
          onClick={importCircuit}
          style={{
            padding: '8px 12px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Import
        </button>

        <button
          onClick={() => {
            if (window.confirm('Clear entire circuit?')) {
              clearCircuit();
            }
          }}
          disabled={nodes.length === 0}
          style={{
            padding: '8px 12px',
            backgroundColor: nodes.length > 0 ? '#f44336' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Clear All
        </button>
      </div>

      {showSaved && savedCircuits.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '120px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '250px',
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            borderBottom: '1px solid #eee',
            paddingBottom: '4px'
          }}>
            Saved Circuits
          </div>
          {savedCircuits.map(circuit => (
            <div
              key={circuit.id}
              style={{
                padding: '8px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{circuit.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {new Date(circuit.createdAt).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {circuit.nodes.length} nodes, {circuit.edges.length} connections
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => loadCircuit(circuit)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => deleteCircuit(circuit.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CircuitManager;
