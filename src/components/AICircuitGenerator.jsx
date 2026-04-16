import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useCircuitStore from '../store/useCircuitStore';

const AICircuitGenerator = () => {
  const { currentTheme } = useTheme();
  const { addNode, addEdge, clearCircuit, generateCircuit } = useCircuitStore();
  
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCircuit, setGeneratedCircuit] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedCircuit(null);

    try {
      const circuit = generateCircuit(description);
      setGeneratedCircuit(circuit);
      
      // Add to generation history
      const historyItem = {
        id: Date.now(),
        description,
        circuit,
        timestamp: new Date().toISOString(),
        confidence: circuit.confidence
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      
      // Add generated circuit to the canvas
      if (circuit.nodes && circuit.edges) {
        clearCircuit();
        
        // Add nodes with proper positioning
        circuit.nodes.forEach((node, index) => {
          const positionedNode = {
            ...node,
            position: {
              x: 100 + (index % 3) * 150,
              y: 100 + Math.floor(index / 3) * 100
            }
          };
          addNode(positionedNode);
        });
        
        // Add edges
        circuit.edges.forEach(edge => {
          addEdge(edge);
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate circuit. Please try a different description.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryClick = (historyItem) => {
    setGeneratedCircuit(historyItem.circuit);
    setDescription(historyItem.description);
  };

  const getSuggestions = () => {
    if (!generatedCircuit) return [];
    
    return generatedCircuit.suggestions || [];
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return currentTheme.success;
    if (confidence >= 0.6) return currentTheme.warning;
    if (confidence >= 0.4) return currentTheme.accent;
    return currentTheme.text.secondary;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '140px',
        left: '20px',
        backgroundColor: currentTheme.surface,
        border: `2px solid ${currentTheme.border}`,
        borderRadius: '8px',
        padding: '15px',
        width: '300px',
        boxShadow: `0 4px 12px ${currentTheme.shadow}`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: currentTheme.text.primary,
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🤖 AI Circuit Generator
        {generatedCircuit && (
          <div
            style={{
              fontSize: '12px',
              color: getConfidenceColor(generatedCircuit.confidence),
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: `${getConfidenceColor(generatedCircuit.confidence)}20`,
            }}
          >
            {Math.round(generatedCircuit.confidence * 100)}% confidence
          </div>
        )}
      </div>

      {/* Input Section */}
      <div style={{ marginBottom: '15px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentTheme.text.primary,
            marginBottom: '8px',
          }}
        >
          Circuit Description:
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your circuit in natural language..."
          style={{
            width: '100%',
            height: '80px',
            padding: '8px',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '4px',
            backgroundColor: currentTheme.background,
            color: currentTheme.text.primary,
            fontSize: '13px',
            resize: 'vertical',
            fontFamily: 'monospace',
          }}
          disabled={isGenerating}
        />
        <div
          style={{
            fontSize: '11px',
            color: currentTheme.text.secondary,
            marginTop: '4px',
            lineHeight: '1.3',
          }}
        >
          Examples:
          <br />
          • "half adder with two inputs and carry output"
          <br />
          • "4-bit binary counter with clock and reset"
          <br />
          • "2-to-1 multiplexer with select lines"
          <br />
          • "3-to-8 decoder for address decoding"
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !description.trim()}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: isGenerating ? currentTheme.text.secondary : currentTheme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
        }}
      >
        {isGenerating ? '🔄 Generating...' : '⚡ Generate Circuit'}
      </button>

      {/* Generated Circuit Info */}
      {generatedCircuit && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: `${currentTheme.primary}10`,
            borderRadius: '4px',
            border: `1px solid ${currentTheme.primary}`,
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            Generated: {generatedCircuit.name}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: currentTheme.text.secondary,
              marginBottom: '6px',
            }}
          >
            {generatedCircuit.description}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: currentTheme.text.secondary,
              marginBottom: '8px',
            }}
          >
            Nodes: {generatedCircuit.nodes?.length || 0} | 
            Edges: {generatedCircuit.edges?.length || 0}
          </div>
          
          {/* Suggestions */}
          {getSuggestions().length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: currentTheme.text.primary,
                  marginBottom: '4px',
                }}
              >
                💡 Suggestions:
              </div>
              {getSuggestions().map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '11px',
                    color: currentTheme.text.secondary,
                    marginBottom: '2px',
                    paddingLeft: '8px',
                    borderLeft: `2px solid ${currentTheme.primary}`,
                  }}
                >
                  • {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div
          style={{
            marginTop: '15px',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: currentTheme.text.primary,
              marginBottom: '8px',
            }}
          >
            📜 Recent Generations:
          </div>
          <div
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
            }}
          >
            {generationHistory.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                style={{
                  padding: '8px',
                  borderBottom: index < generationHistory.length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${currentTheme.primary}20`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: currentTheme.text.primary,
                    marginBottom: '2px',
                  }}
                >
                  {item.description.substring(0, 30)}...
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: currentTheme.text.secondary,
                  }}
                >
                  {item.confidence ? `${Math.round(item.confidence * 100)}% confidence` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AICircuitGenerator;
