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
        File Operations
      </div>
      
      {/* Button container with absolute positioning */}
      <div style={{ 
        position: 'relative',
        width: '100%',
        height: '350px'
      }}>
        {/* Row 1 */}
        <button
          onClick={saveCircuit}
          disabled={nodes.length === 0}
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100px',
            height: '50px',
            backgroundColor: nodes.length > 0 ? '#22c55e' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Save</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>Circuit</div>
        </button>

        <button
          onClick={() => setShowSaved(!showSaved)}
          disabled={savedCircuits.length === 0}
          style={{
            position: 'absolute',
            top: '0px',
            left: '105px',
            width: '100px',
            height: '50px',
            backgroundColor: savedCircuits.length > 0 ? '#3b82f6' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: savedCircuits.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Load</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>({savedCircuits.length})</div>
        </button>

        {/* Row 2 */}
        <button
          onClick={exportCircuit}
          disabled={nodes.length === 0}
          style={{
            position: 'absolute',
            top: '55px',
            left: '0px',
            width: '100px',
            height: '50px',
            backgroundColor: nodes.length > 0 ? '#f97316' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Export</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>JSON</div>
        </button>

        <button
          onClick={() => downloadVerilog(nodes, edges)}
          disabled={nodes.length === 0}
          style={{
            position: 'absolute',
            top: '55px',
            left: '105px',
            width: '100px',
            height: '50px',
            backgroundColor: nodes.length > 0 ? '#6366f1' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Export</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>Verilog</div>
        </button>

        {/* Row 3 */}
        <button
          onClick={importCircuit}
          style={{
            position: 'absolute',
            top: '110px',
            left: '0px',
            width: '100px',
            height: '50px',
            backgroundColor: '#a855f7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Import</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>File</div>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Clear entire circuit?')) {
              clearCircuit();
            }
          }}
          disabled={nodes.length === 0}
          style={{
            position: 'absolute',
            top: '110px',
            left: '105px',
            width: '100px',
            height: '50px',
            backgroundColor: nodes.length > 0 ? '#ef4444' : '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: nodes.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '700' }}>Clear</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>All</div>
        </button>
      </div>

      {/* Saved Circuits Section */}
      {showSaved && savedCircuits.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '170px',
          left: '0px',
          width: '205px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '6px',
          maxHeight: '120px',
          overflow: 'auto'
        }}>
          <div style={{ 
            fontSize: '9px',
            fontWeight: '700', 
            color: '#f8fafc',
            marginBottom: '4px',
            borderBottom: '1px solid #334155',
            paddingBottom: '2px'
          }}>
            Saved Circuits ({savedCircuits.length})
          </div>
          
          {savedCircuits.map(circuit => (
            <div
              key={circuit.id}
              style={{
                padding: '3px',
                borderBottom: '1px solid #334155',
                marginBottom: '2px'
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                fontSize: '8px', 
                color: '#f8fafc',
                marginBottom: '1px'
              }}>
                {circuit.name}
              </div>
              <div style={{ 
                fontSize: '7px', 
                color: '#94a3b8',
                marginBottom: '2px'
              }}>
                {circuit.nodes.length} nodes, {circuit.edges.length} connections
              </div>
              
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  onClick={() => loadCircuit(circuit)}
                  style={{
                    padding: '1px 4px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '7px',
                    fontWeight: '600'
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => deleteCircuit(circuit.id)}
                  style={{
                    padding: '1px 4px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '7px',
                    fontWeight: '600'
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
